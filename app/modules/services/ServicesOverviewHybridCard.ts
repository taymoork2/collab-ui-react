import { ICardParams, ServicesOverviewCard } from './ServicesOverviewCard';

export interface IHybridCardParams extends ICardParams {
  activeServices: Array<string>;
  statusService: string;
  routerState: string;
}
export interface IServiceStatus {
  serviceId: string;
  status: string;
  setup: boolean;
}

export abstract class ServicesOverviewHybridCard extends ServicesOverviewCard {
  private activeServices: Array<string>;
  private statusService: string;
  private routerState: string;

  public constructor(
    params: IHybridCardParams,
    private FusionClusterStatesService
  ) {
    super(params);
    this.activeServices = params.activeServices;
    this.statusService = params.statusService;
    this.routerState = params.routerState;
  }

  public hybridStatusEventHandler(services: Array<IServiceStatus>): void {
    this._status = {
      status: this.filterAndGetCssStatus(services, this.statusService),
      text: this.filterAndGetTxtStatus(services, this.statusService),
      routerState: this.routerState,
    };
    this._active = this.filterAndGetEnabledService(services, this.activeServices);
    this._loading = false;
  }

  public IserviceStatusToTxt = {
    operational: 'servicesOverview.cardStatus.operational',
    impaired: 'servicesOverview.cardStatus.impaired',
    outage: 'servicesOverview.cardStatus.outage',
    unknown: 'servicesOverview.cardStatus.unknown',
  };

  protected filterAndGetCssStatus(services: Array<IServiceStatus>, serviceId: string): string | undefined {
    let service = _.find(services, (service) => service.serviceId === serviceId);
    if (service) {
      return this.FusionClusterStatesService.getStatusIndicatorCSSClass(service.status);
    }
    return undefined;
  }

  protected filterAndGetTxtStatus(services: Array<IServiceStatus>, serviceId: string): string | undefined {
    let service = _.find(services, (service) => service.serviceId === serviceId);
    if (service) {
      return this.IserviceStatusToTxt[service.status] || this.IserviceStatusToTxt['unknown'];
    }
    return undefined;
  }

  protected filterAndGetEnabledService(services: Array<IServiceStatus>, serviceIds: Array<String>): boolean {
    return _.some(serviceIds, (serviceId) => {
      let service = _.find(services, (service) => service.serviceId === serviceId);
      return service && service.setup;
    });
  }
}
