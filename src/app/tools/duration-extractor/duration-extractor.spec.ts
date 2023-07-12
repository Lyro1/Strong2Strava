import { DurationExtractor } from './duration-extractor';

describe('DurationExtractor', () => {
  it('should extract 60 seconds from 1min pattern', () => {
    const pattern: string = '1min';
    const expected: number = 60;
    const extractor = new DurationExtractor(pattern);
    expect(extractor.getDurationInSeconds()).toEqual(expected);
  });

  it('should extract 120 seconds from 2min pattern', () => {
    const pattern: string = '2min';
    const expected: number = 120;
    const extractor = new DurationExtractor(pattern);
    expect(extractor.getDurationInSeconds()).toEqual(expected);
  });

  it('should extract 60 seconds from 1m pattern', () => {
    const pattern: string = '1m';
    const expected: number = 60;
    const extractor = new DurationExtractor(pattern);
    expect(extractor.getDurationInSeconds()).toEqual(expected);
  });

  it('should extract 3000 seconds from 50m pattern', () => {
    const pattern: string = '50m';
    const expected: number = 3000;
    const extractor = new DurationExtractor(pattern);
    expect(extractor.getDurationInSeconds()).toEqual(expected);
  });

  it('should extract 120 seconds from 2m pattern', () => {
    const pattern: string = '2m';
    const expected: number = 120;
    const extractor = new DurationExtractor(pattern);
    expect(extractor.getDurationInSeconds()).toEqual(expected);
  });

  it('should extract 3600 seconds from 1h pattern', () => {
    const pattern: string = '1h';
    const expected: number = 3600;
    const extractor = new DurationExtractor(pattern);
    expect(extractor.getDurationInSeconds()).toEqual(expected);
  });

  it('should extract 5400 seconds from 1h30min pattern', () => {
    const pattern: string = '1h30min';
    const expected: number = 5400;
    const extractor = new DurationExtractor(pattern);
    expect(extractor.getDurationInSeconds()).toEqual(expected);
  });

  it('should extract 5400 seconds from 1h30m pattern', () => {
    const pattern: string = '1h30m';
    const expected: number = 5400;
    const extractor = new DurationExtractor(pattern);
    expect(extractor.getDurationInSeconds()).toEqual(expected);
  });

  it('should extract 0 seconds from \'fresf\' pattern', () => {
    const pattern: string = 'fresf';
    const expected: number = 0;
    const extractor = new DurationExtractor(pattern);
    expect(extractor.getDurationInSeconds()).toEqual(expected);
  });
});
