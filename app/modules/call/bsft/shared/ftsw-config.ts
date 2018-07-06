import { ISite } from './bsft-site';

export interface IFtswConfig {
  sites: ISite[];
}

export class FtswConfig implements IFtswConfig {
  public sites: ISite[];

  constructor(ftswConfig: IFtswConfig = {
    sites: [],
  }) {
    this.sites = ftswConfig.sites;
  }
}
