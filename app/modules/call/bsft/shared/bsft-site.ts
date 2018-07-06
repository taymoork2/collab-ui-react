const DEFAULT_TIME_ZONE: string = 'America/Los_Angeles';

export interface ISite {
  name: string;
  timeZone: string;
  numbers: string[];
}

export class Site implements Site {
  public name: string;
  public timeZone: string;
  public numbers: string[];

  constructor(site: ISite = {
    name: '',
    timeZone: DEFAULT_TIME_ZONE,
    numbers: [],
  }) {
    this.name = site.name;
    this.timeZone = site.timeZone;
    this.numbers = site.numbers;
  }
}
