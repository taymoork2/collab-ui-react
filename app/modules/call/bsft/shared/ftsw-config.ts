import { IBsftOrder } from './bsft-order';
import { ISite, ILicenseInfo } from './bsft-site';

export interface IFtswConfig {
  sites: ISite[];
  bsftOrders: IBsftOrder[];
  licenses: ILicenseInfo[];
}

export class FtswConfig implements IFtswConfig {
  public sites: ISite[];
  public bsftOrders: IBsftOrder[];
  public licenses: ILicenseInfo[];

  constructor(ftswConfig: IFtswConfig = {
    sites: [],
    bsftOrders: [],
    licenses: [],
  }) {
    this.sites = ftswConfig.sites;
    this.bsftOrders = ftswConfig.bsftOrders;
    this.licenses = ftswConfig.licenses;
  }
}
