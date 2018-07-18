import { FtswConfig } from './ftsw-config';
import { BsftOrder } from './bsft-order';
import { Site, ILicenseInfo } from './bsft-site';
import { Authinfo } from 'modules/core/scripts/services/authinfo';

export class FtswConfigService {

  private ftswConfig: FtswConfig;
  private editSite: Site | undefined;

  /* @ngInject */
  constructor(
    private Authinfo: Authinfo,
  ) {
    this.ftswConfig = new FtswConfig();
    this.initLicenseInfo();
  }

  public initLicenseInfo() {
    const services = this.Authinfo.getCommunicationServices();
    const standardLicense: any = _.find(services, { name: 'commStandardRadio' });
    const placesLicense: any = _.find(services, { name: 'commPlacesRadio' });
    if (!_.isUndefined(standardLicense)) {
      this.ftswConfig.licenses.push({
        name: 'standard',
        total: standardLicense.license.volume,
      });
    }
    if (!_.isUndefined(placesLicense)) {
      this.ftswConfig.licenses.push({
        name: 'places',
        total: placesLicense.license.volume,
      });
    }
  }

  public getFtswConfig(): FtswConfig {
    return _.cloneDeep(this.ftswConfig);
  }

  public getSites(): Site[] {
    return _.get(this.ftswConfig, 'sites', []);
  }

  public setSites(sites: Site[]) {
    _.set(this.ftswConfig, 'sites', sites);
  }

  public addSite(site: Site) {
    this.ftswConfig.sites.push(site);
  }

  public removeSite(site: Site) {
    _.remove(this.ftswConfig.sites, (s) => s.name === site.name);
  }

  public getLicensesInfo(): ILicenseInfo[] {
    return _.get(this.ftswConfig, 'licenses', []);
  }

  public getOrders(): BsftOrder[] {
    return _.get(this.ftswConfig, 'orders', []);
  }

  public setOrders(orders: BsftOrder[]) {
    _.set(this.ftswConfig, 'Orders', orders);
  }

  public addOrder(order: BsftOrder) {
    this.ftswConfig.bsftOrders.push(order);
  }

  public getOrder(siteId: string): BsftOrder {
    const bsftOrder: BsftOrder = new BsftOrder();
    bsftOrder.siteId = siteId;
    this.addOrder(bsftOrder);
    return bsftOrder;
  }

  public isLicensePresent(name: string) {
    return !_.isUndefined(_.find(this.ftswConfig.licenses, { name: name }));
  }

  public setEditSite(site: Site) {
    this.editSite = site;
  }

  public getEditSite() {
    const copySite = _.cloneDeep(this.editSite);
    this.editSite = undefined;
    return copySite;
  }

  public updateSite(site) {
    const siteindex = _.findIndex(this.getSites(), (findSite) => findSite.uuid === site.uuid);
    this.getSites()[siteindex] = site;
  }

  public removeDefault() {
    const site = _.find(this.getSites(), (findSite) => findSite.defaultLocation === true);
    site.defaultLocation = false;
    this.updateSite(site);
  }
}
