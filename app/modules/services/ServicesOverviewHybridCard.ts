import { ICardParams, ServicesOverviewCard } from './ServicesOverviewCard';

export interface IHybridCardParams extends ICardParams {
  activeServices: Array<string>;
  statusServices: Array<string>;
  routerState: string;
}

export interface IServiceStatus {
  serviceId: string;
  status: string;
  setup: boolean;
}

export abstract class ServicesOverviewHybridCard extends ServicesOverviewCard {
  private activeServices: Array<string>;
  private statusServices: Array<string>;
  private routerState: string;

  public constructor(
    params: IHybridCardParams,
    private FusionClusterStatesService
  ) {
    super(params);
    this.activeServices = params.activeServices;
    this.statusServices = params.statusServices;
    this.routerState = params.routerState;
  }

  public hybridStatusEventHandler(services: Array<IServiceStatus>): void {
    this.status = {
      status: this.filterAndGetCssStatus(services, this.statusServices[0]),
      text: this.filterAndGetTxtStatus(services, this.statusServices[0]),
      routerState: this.routerState,
    };
    this.active = this.filterAndGetEnabledService(services, this.activeServices);
    this.loading = false;
  }

  public IserviceStatusToTxt = {
    operational: 'servicesOverview.cardStatus.operational',
    impaired: 'servicesOverview.cardStatus.impaired',
    outage: 'servicesOverview.cardStatus.outage',
    unknown: 'servicesOverview.cardStatus.unknown',
    setupNotComplete: 'servicesOverview.cardStatus.setupNotComplete',
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
