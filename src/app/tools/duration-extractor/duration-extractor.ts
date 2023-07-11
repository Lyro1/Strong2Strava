export class DurationExtractor {
  private static readonly SECONDS_IN_MINUTES: number = 60;
  private static readonly MINUTES_IN_HOUR: number = 60;
  private static readonly LONG_MINUTES_PART = 'min';
  private static readonly SHORT_MINUTES_PART = 'm';

  public constructor(private readonly pattern: string) {
  }

  public getDurationInSeconds(): number {
    return this.extractHoursToSeconds(this.pattern) + this.extractMinutesToSeconds(this.pattern);
  }

  private extractMinutesToSeconds(pattern: string): number {
    let minutes: number = this.extractUnit(DurationExtractor.LONG_MINUTES_PART, pattern);
    if (minutes <= 0) {
      minutes = this.extractUnit(DurationExtractor.SHORT_MINUTES_PART, pattern);
    }
    return minutes * DurationExtractor.SECONDS_IN_MINUTES;
  }

  private extractHoursToSeconds(pattern: string): number {
    return (this.extractUnit('h', pattern)) * DurationExtractor.MINUTES_IN_HOUR * DurationExtractor.SECONDS_IN_MINUTES
  }

  private extractUnit(type: 'min' | 'm' | 'h', pattern: string): number {
    const regexTemplate = `([1-9]+)${type}`;
    const regex = new RegExp(regexTemplate, 'gm');
    const result = regex.exec(pattern);
    if (!result || result?.length <= 1) {
      return 0;
    }
    return parseInt(result[1])
  }
}
