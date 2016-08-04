import { CardParams, ServicesOverviewCard } from './ServicesOverviewCard';

export interface HybridCardParams extends CardParams {
  activeServices:Array<string>;
  statusServices:Array<string>;
  statusLink:string;
}
export abstract class ServicesOverviewHybridCard extends ServicesOverviewCard {
  private activeServices:Array<string>;
  private statusServices:Array<string>;
  private statusLink:string;

  public constructor(params:HybridCardParams) {
    super(params);
    this.activeServices = params.activeServices;
    this.statusServices = params.statusServices;
    this.statusLink = params.statusLink;
  }

  public hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>):void {
    this._status = {
      status: this.filterAndGetCssStatus(services, this.statusServices),
      text: this.filterAndGetTxtStatus(services, this.statusServices),
      link: this.statusLink
    };
    this._active = this.filterAndGetEnabledService(services, this.activeServices);
    this._loading = false;
  }
  serviceStatusToCss = {
    ok: 'success',
    warn: 'warning',
    error: 'danger',
    disabled: 'disabled',
    undefined: 'warning'
  };

  serviceStatusToTxt = {
    ok: 'servicesOverview.cardStatus.running',
    warn: 'servicesOverview.cardStatus.alarms',
    error: 'servicesOverview.cardStatus.error',
    disabled: 'servicesOverview.cardStatus.disabled',
    undefined: 'servicesOverview.cardStatus.alarms'
  };

  serviceEnabledWeight = {
    'true': 2,
    'false': 1,
    undefined: 0
  };
  serviceStatusWeight = {
    ok: 1,
    warn: 2,
    error: 3,
    disabled: 4,
    undefined: 0
  };

  private filterAndGetStatus(services:Array<{id:string,status:string}>, serviceIds:Array<string>):string {
    let startVal:string = undefined;
    let callServiceStatus:string = services.filter((service)=> {
      return _.indexOf(serviceIds, service.id) >= 0;
    }).reduce((result, serv)=> {
      return this.serviceStatusWeight[serv.status] > this.serviceStatusWeight[result] ? serv.status : result;
    }, startVal);
    return callServiceStatus;
  }

  protected filterAndGetCssStatus(services:Array<{id:string,status:string}>, serviceIds:Array<string>):string {
    let callServiceStatus = this.filterAndGetStatus(services, serviceIds);
    if (callServiceStatus) {
      return this.serviceStatusToCss[callServiceStatus] || this.serviceStatusToCss['undefined'];
    }
    return undefined;
  }

  protected filterAndGetTxtStatus(services:Array<{id:string,status:string}>, serviceIds:Array<string>):string {
    let callServiceStatus = this.filterAndGetStatus(services, serviceIds);
    if (callServiceStatus) {
      return this.serviceStatusToTxt[callServiceStatus] || this.serviceStatusToTxt['undefined'];
    }
    return undefined;
  }

  protected filterAndGetEnabledService(services:Array<{id:string,enabled:boolean}>, serviceIds:Array<String>):boolean {
    let startVal = undefined;
    let res = services.filter((service)=> {
      return _.indexOf(serviceIds, service.id) >= 0;
    }).reduce((result, serv)=> {
      return this.serviceEnabledWeight['' + serv.enabled] > this.serviceEnabledWeight['' + result] ? serv.enabled : result;
    }, startVal);
    return _.isUndefined(res) ? false : res;
  }
}
