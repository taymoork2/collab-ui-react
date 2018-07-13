import { ISite } from './bsft-site';
import { IBsftOrder } from './bsft-order';

export interface IFtswConfig {
  sites: ISite[];
  bsftOrders: IBsftOrder[];
}

export class FtswConfig implements IFtswConfig {
  public sites: ISite[];
  public bsftOrders: IBsftOrder[];

  constructor(ftswConfig: IFtswConfig = {
    sites: [],
    bsftOrders: [],
  }) {
    this.sites = ftswConfig.sites;
    this.bsftOrders = ftswConfig.bsftOrders;
  }
}
