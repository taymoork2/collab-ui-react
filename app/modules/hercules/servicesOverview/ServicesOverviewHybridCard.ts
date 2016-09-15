import { CardParams, ServicesOverviewCard } from './ServicesOverviewCard';

export interface HybridCardParams extends CardParams {
  activeServices:Array<string>;
  statusService:string;
  statusLink:string;
}
export abstract class ServicesOverviewHybridCard extends ServicesOverviewCard {
  private activeServices:Array<string>;
  private statusService:string;
  private statusLink:string;

  public constructor(params:HybridCardParams) {
    super(params);
    this.activeServices = params.activeServices;
    this.statusService = params.statusService;
    this.statusLink = params.statusLink;
  }

  public hybridStatusEventHandler(services:Array<{serviceId:string, status:string, setup:boolean}>):void {
    this._status = {
      status: this.filterAndGetCssStatus(services, this.statusService),
      text: this.filterAndGetTxtStatus(services, this.statusService),
      link: this.statusLink
    };
    this._active = this.filterAndGetEnabledService(services, this.activeServices);
    this._loading = false;
  }
  serviceStatusToCss = {
    operational: 'success',
    impaired: 'warning',
    outage: 'danger',
    unknown: 'warning'
  };

  serviceStatusToTxt = {
    operational: 'servicesOverview.cardStatus.operational',
    impaired: 'servicesOverview.cardStatus.impaired',
    outage: 'servicesOverview.cardStatus.outage',
    unknown: 'servicesOverview.cardStatus.unknown'
  };

  protected filterAndGetCssStatus(services:Array<{serviceId:string, status:string, setup:boolean}>, serviceId:string):string {
    let service = _.find(services, (service) => service.serviceId === serviceId);
    if (service) {
      return this.serviceStatusToCss[service.status] || this.serviceStatusToCss['unknown'];
    }
    return undefined;
  }

  protected filterAndGetTxtStatus(services:Array<{serviceId:string, status:string, setup:boolean}>, serviceId:string):string {
    let service = _.find(services, (service) => service.serviceId === serviceId);
    if (service) {
      return this.serviceStatusToTxt[service.status] || this.serviceStatusToTxt['unknown'];
    }
    return undefined;
  }

  protected filterAndGetEnabledService(services:Array<{serviceId:string, status:string, setup:boolean}>, serviceIds:Array<String>):boolean {
    return _.some(serviceIds, (serviceId) => {
      let service = _.find(services, (service) => service.serviceId === serviceId);
      return service && service.setup;
    });
  }
}
