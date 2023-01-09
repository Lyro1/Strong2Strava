import {Component, OnInit} from '@angular/core';
import {StravaService} from "../../services/strava/strava.service";
import {StravaToken} from "../authorize/authorize.component";
import {DetailledActivity, SummaryActivity} from "../../services/strava/models/Activity.model";

export interface Training {
  date: Date
  name: string
  duration: number
  notes: string
  exercises: Exercise[]
}

export interface Exercise {
  name: string
  reps: Rep[]
}

export interface Rep {
  order: number
  weight: number
  reps: number,
  distance: number,
  seconds: number,
  notes: string|null
  RPE: number|null
}

@Component({
  selector: 'app-import-page',
  templateUrl: './import-page.component.html',
  styleUrls: ['./import-page.component.scss']
})
export class ImportPageComponent implements OnInit {

  public isLoggedIn = false;
  public dataIsLoaded = false;
  public file: any;
  public fileContent: any;
  public trainings: Training[] = [];
  public stravaActivities: SummaryActivity[] = [];

  constructor(private stravaService: StravaService) {
  }

  ngOnInit() {
    if (!localStorage.getItem(StravaToken.accessToken)) {
      this.stravaService.removeStravaLocalStorage();
      this.isLoggedIn = false;
      return;
    }
    const expiresAt = localStorage.getItem(StravaToken.expires_at);
    if (expiresAt === undefined || expiresAt === null ) {
      this.stravaService.removeStravaLocalStorage();
      this.isLoggedIn = false;
      return;
    }
    if (parseInt(expiresAt) < (Date.now() / 1000)) {
      this.stravaService.refreshAccessToken();
      return;
    }
    this.isLoggedIn = true;

    if (this.isLoggedIn) {
      this.stravaService.getActivities()?.subscribe((activities: SummaryActivity[]) => {
        this.stravaActivities = activities;
      })
    }
  }

  public getStravaAuthorization() {
    window.location.href = this.stravaService.getAuthorizeURL();
  }

  public fileChange(event: any) {
    const file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.fileContent = fileReader.result;
      this.fileContent = this.fileContent.split('\n').slice(1).map((line: string) => this.getObjectFromArray(line.replaceAll('\"', '').split(',')));
      this.fileContent.pop();
      this.trainings = this.parseAllTrainings(this.fileContent);
    }
    fileReader.readAsText(file);
  }

  private getObjectFromArray(data: any): any
  {
    return {
      date: data[0],
      trainingName: data[1],
      duration: data[2],
      exerciseName: data[3],
      order: data[4],
      weight: data[5],
      reps: data[6],
      distance: data[7],
      seconds: data[8],
      notes: data[9],
      trainingNotes: data[10],
      RPE: data[11]
    };
  }

  private parseAllTrainings(objects: any[])
  {
    let trainings: Training[] = [];
    objects.forEach((object, index) => {
      // Create Training if needed, find it if it exists
      let objectDate: Date = new Date(object.date);
      let trainingIndex = trainings.findIndex(function(training, index) { return training.date.getTime() === objectDate.getTime()});
      if (trainingIndex === -1) {
        const training = this.createTraining(object);
        if (training !== null) {
          trainings.push(training);
          trainingIndex = trainings.length - 1;
        }
      }

      // Create Exercise if needed, find it if it exists
      let exerciseName: string = object.exerciseName;
      let exerciseIndex = trainings[trainingIndex].exercises.findIndex(function(exercise, index) {return exercise.name === exerciseName});
      if (exerciseIndex === -1) {
        const exercise = this.createExercise(object);
        if (exercise !== null) {
          trainings[trainingIndex].exercises.push(exercise);
          exerciseIndex = trainings[trainingIndex].exercises.length - 1;
        }
      }

      // Create Rep and add it to correct exercise and training
      let rep = this.createRep(object);
      if (rep !== null) {
        trainings[trainingIndex].exercises[exerciseIndex].reps.push(rep);
      }
    });
    this.dataIsLoaded = true;
    return trainings;
  }

  private createTraining(object: any): Training|null {
    if (!('date' in object) || !('trainingName' in object) || !('duration' in object) || !('trainingNotes' in object)) {
      console.error('Object has missing properties (needs \'date\', \'trainingName\', \'duration\', \'trainingNotes\').')
      return null;
    }
    return {
      date: new Date(object.date),
      name: object.trainingName,
      duration: this.getDurationInSeconds(object.duration),
      notes: object.trainingNotes,
      exercises: []
    } as Training;
  }

  private createExercise(object: any): Exercise|null {
    if (!('exerciseName' in object)) {
      console.error('Object has missing properties (needs \'exerciseName\').')
      return null;
    }
    return {
      name: object.exerciseName,
      reps: []
    } as Exercise;
  }

  private createRep(object: any): Rep|null {
    if (!('order' in object) || !('weight' in object) || !('reps' in object) || !('distance' in object)
    || !('seconds' in object) || !('notes' in object) || !('RPE' in object)) {
      console.error('Object has missing properties (needs \'order\', \'weight\', \'reps\', \'distance\', \'seconds\', \'notes\', \'RPE\').')
      return null;
    }
    return {
      order: object.order,
      weight: object.weight,
      reps: object.reps,
      distance: object.distance,
      seconds: object.seconds,
      notes: object.notes,
      RPE: object.rpe
    } as Rep;
  }

  private getDurationInSeconds(duration: string): number {
    if (duration === undefined || duration === null) {
      return -1;
    }
    let nbOfSeconds = 0;
    if (duration.indexOf('h') !== -1) {
     nbOfSeconds += parseInt(duration.substring(0, duration.indexOf('h'))) * 60 * 60;
     duration = duration.substring(duration.indexOf('h') + 1);
    }
    if (duration !== '') {
      nbOfSeconds += parseInt(duration.substring(0, duration.indexOf('min'))) * 60;
    }
    return nbOfSeconds;
  }

  public importTrainingToStrava(training: Training) {
    this.stravaService.createActivity(training).subscribe((activity: SummaryActivity) => {
      this.stravaActivities.push(activity);
    });
  }

  public getTrainingDescriptionInStrava(training: Training): string {
    return this.stravaService.getActivityDescription(training).replace(/\n/g, "<br />");
  }

  public isTrainingAlreadyInStrava(training: Training): boolean {
    return this.stravaActivities.findIndex((activity: SummaryActivity) => {
      return activity.name === training.name && activity.start_date === training.date.toISOString().replace(/\.\d+/, "");;
    }) !== -1;
  }

}
