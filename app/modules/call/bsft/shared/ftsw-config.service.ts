import { FtswConfig } from './ftsw-config';
import { BsftOrder } from './bsft-order';
import { Site, ILicenseInfo } from './bsft-site';
import { Authinfo } from 'modules/core/scripts/services/authinfo';

export class FtswConfigService {

  private ftswConfig: FtswConfig;
  private editSite: Site | undefined;
  private currentSite: Site | undefined;
  private currentCustomer;

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

  public setSites(sites: Site[]): void {
    _.set(this.ftswConfig, 'sites', sites);
  }

  public addSite(site: Site): void {
    this.currentSite = undefined;
    if (this.isExisitingSite(site)) {
      this.updateSite(site);
    } else {
      this.ftswConfig.sites.push(site);
    }
  }

  public removeSite(site: Site): void {
    _.remove(this.ftswConfig.sites, (s) => s.name === site.name);
  }

  public getLicensesInfo(): ILicenseInfo[] {
    return _.get(this.ftswConfig, 'licenses', []);
  }

  public setLicensesInfo(licenses: ILicenseInfo[]): void {
    _.set(this.ftswConfig, 'licenses', licenses);
  }

  public getOrders(): BsftOrder[] {
    return _.get(this.ftswConfig, 'orders', []);
  }

  public setOrder(order: BsftOrder): void {
    const index = _.findIndex(this.ftswConfig.bsftOrders, item => item.siteId === order.siteId);
    this.ftswConfig.bsftOrders[index] = order;
  }

  public addOrder(order: BsftOrder): void {
    this.ftswConfig.bsftOrders.push(order);
  }

  public getOrder(siteId: string): BsftOrder {
    let bsftOrder: BsftOrder = _.find(this.ftswConfig.bsftOrders, order => order.siteId === siteId );
    if (_.isUndefined(bsftOrder)) {
      bsftOrder = new BsftOrder();
      bsftOrder.siteId = siteId;
      this.addOrder(bsftOrder);
    }
    return bsftOrder;
  }

  public addNumbersToOrder(siteId: string, numbers: string[]): void {
    const bsftOrder = this.getOrder(siteId);
    _.set(bsftOrder, 'portedNumbers', numbers);
    // _.forEach(numbers, (number) => {
    //   bsftOrder.portedNumbers.push({ portingNumber: { telephoneNumber: { e164: number }}, provisionAsActive: !isBsftPorted });
    // });
  }

  public assignNumbers(siteId: string, mainNumber: string, vmNumber: string): void {
    const bsftOrder: BsftOrder = _.find(this.ftswConfig.bsftOrders, order => order.siteId === siteId );
    if (!_.isUndefined(bsftOrder)) {
      bsftOrder.mainNumber = mainNumber; //{ telephoneNumber: { e164: mainNumber } };
      bsftOrder.vmNumber = vmNumber;
    }
  }

  public setLicenseInfo(name: string, available: number) {
    _.set(_.find(this.ftswConfig.licenses, { name: name }), 'available' , available);
  }

  public isLicensePresent(name: string): boolean {
    return !_.isUndefined(_.find(this.ftswConfig.licenses, { name: name }));
  }

  public setEditSite(site: Site): void {
    this.editSite = site;
  }

  public getEditSite(): Site | undefined {
    const copySite = _.cloneDeep(this.editSite);
    this.editSite = undefined;
    return copySite;
  }

  public isExisitingSite(site): boolean {
    return  !_.isUndefined(_.find(this.getSites(),  (findSite) => findSite.uuid === site.uuid));
  }

  public updateSite(site): void {
    const siteindex = _.findIndex(this.getSites(), (findSite) => findSite.uuid === site.uuid);
    this.getSites()[siteindex] = site;
  }

  public removeDefault(): void {
    const site = _.find(this.getSites(), (findSite) => findSite.defaultLocation === true);
    site.defaultLocation = false;
    this.updateSite(site);
  }

  public setCurrentSite(site): void {
    this.currentSite = site;
  }

  public getCurentSite(): Site | undefined {
    return this.currentSite;
  }

  public setCurrentCustomer(customer): void {
    this.currentCustomer = customer;
  }

  public getCurrentCustomer() {
    return this.currentCustomer;
  }
}
