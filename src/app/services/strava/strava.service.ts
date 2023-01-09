import { Injectable } from '@angular/core';
import {StravaToken, Tokens} from "../../pages/authorize/authorize.component";
import {Training} from "../../pages/import-page/import-page.component";
import {ActivityType, DetailledActivity, SummaryActivity} from "./models/Activity.model";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StravaService {

  private client_id = 99768;
  private client_secret = "e7ed049f182611bcc463cab19e4c720c4edc78c4";
  private base_url = "https://www.strava.com/";
  private redirect_uri = "http://localhost:4200/authorize";
  private response_type = "code";
  private approval_prompt = "auto";
  private scope = "activity:write,activity:read_all";

  constructor(private http: HttpClient) { }

  public getAuthorizationToken() {
    return localStorage.getItem(StravaToken.accessToken);
  }

  public getAuthorizeURL() {
    return this.base_url + 'oauth/authorize'
      + encodeURI('?client_id=' + this.client_id
      + '&redirect_uri=' + this.redirect_uri
      + '&response_type=' + this.response_type
      + '&approval_prompt=' + this.approval_prompt
      + '&scope=' + this.scope);
  }

  public getTokenRequestURL() {
    return this.base_url + 'api/v3/oauth/token'
  }

  public getTokenRequestBody(code: string) {
    return {
      client_id: this.client_id,
      client_secret: this.client_secret,
      code: code,
      grant_type: "authorization_code"
    }
  }

  public refreshAccessToken() {
    const expiresAt = localStorage.getItem(StravaToken.expires_at);
    if (!expiresAt || !localStorage.getItem(StravaToken.refreshToken) || parseInt(expiresAt) >= (Date.now() / 1000)) {
      return;
    }
    this.http.post<Tokens>(
      this.getTokenRequestURL(),
      {
        client_id: this.client_id,
        client_secret: this.client_secret,
        refresh_token: localStorage.getItem(StravaToken.refreshToken),
        grant_type: "refresh_token"
      })
      .subscribe(
        (data: Tokens) => {
          localStorage.setItem(StravaToken.accessToken, data.access_token);
          localStorage.setItem(StravaToken.refreshToken, data.refresh_token);
          localStorage.setItem(StravaToken.expires_at, data.expires_at.toString());
        }
      )
  }

  public getActivities(): Observable<SummaryActivity[]>|null
  {
    if (!this.getAuthorizationToken()) {
      return null;
    }
    // TODO: clean the per_page argument because it will broke once it reaches 200 activities in Strava
    return this.http.get<SummaryActivity[]>(
      this.base_url + 'api/v3/athlete/activities?per_page=200'
    );
  }

  public removeStravaLocalStorage() {
    localStorage.removeItem(StravaToken.accessToken);
    localStorage.removeItem(StravaToken.refreshToken);
    localStorage.removeItem(StravaToken.expires_at);
  }

  public createActivity(training: Training): Observable<SummaryActivity>
  {
    const body = {
      name: training.name,
      sport_type: ActivityType.Workout,
      start_date_local: new Date(training.date).toISOString(),
      elapsed_time: training.duration,
      description: this.getActivityDescription(training)
    }
    return this.http.post<SummaryActivity>(
      this.base_url + 'api/v3/activities',
      body
    );
  }

  public getActivityDescription(training: Training): string
  {
    let description = '';
    training.exercises.forEach((exercise) => {
      description += '💪 ' + exercise.name + ':\n'
      exercise.reps.forEach((rep) => {
        let many = false;
        description += '  | ' + rep.order + ' - '
        if (rep.weight > 0) {
          description += 'Weight: ' + rep.weight + 'kg'
          many = true;
        }
        if (rep.reps > 0) {
          description += many ? ' / ' : '';
          description += 'Reps: ' + rep.reps
          many = true;
        }
        if (rep.seconds > 0) {
          description += many ? ' / ' : '';
          description += 'Seconds: ' + rep.seconds + 's'
          many = true;
        }
        description += '\n';
      });
      description += '\n';
    });
    if (training.notes) {
      description += '\n';
      description += training.notes;
    }
    return description;
  }


}
