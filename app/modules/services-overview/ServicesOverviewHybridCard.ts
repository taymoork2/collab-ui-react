import { ICardParams, ServicesOverviewCard } from './ServicesOverviewCard';

export interface IHybridCardParams extends ICardParams {
  service: string;
  routerState: string;
  initEventsNumber?: number;
}

export interface IServiceStatus {
  serviceId: string;
  status: string;
  setup: boolean;
}

const IserviceStatusToTxt = {
  operational: 'servicesOverview.cardStatus.operational',
  impaired: 'servicesOverview.cardStatus.impaired',
  outage: 'servicesOverview.cardStatus.outage',
  unknown: 'servicesOverview.cardStatus.unknown',
  setupNotComplete: 'servicesOverview.cardStatus.setupNotComplete',
};

export function filterAndGetCssStatus(HybridServicesClusterStatesService, services: Array<IServiceStatus>, serviceId: string): string | undefined {
  let service = _.find(services, (service) => service.serviceId === serviceId);
  if (service) {
    return HybridServicesClusterStatesService.getStatusIndicatorCSSClass(service.status);
  }
  return undefined;
}

export function filterAndGetTxtStatus(services: Array<IServiceStatus>, serviceId: string): string | undefined {
  let service = _.find(services, (service) => service.serviceId === serviceId);
  if (service) {
    return IserviceStatusToTxt[service.status] || IserviceStatusToTxt['unknown'];
  }
  return undefined;
}

export function filterAndGetEnabledService(statuses: Array<IServiceStatus>, serviceId: string): boolean {
  let service = _.find(statuses, (service) => service.serviceId === serviceId);
  return service && service.setup;
}

export abstract class ServicesOverviewHybridCard extends ServicesOverviewCard {
  private service: string;
  private routerState: string;
  protected initEventsNumber = 0;

  public constructor(
    params: IHybridCardParams,
    private HybridServicesClusterStatesService,
  ) {
    super(params);
    this.service = params.service;
    this.routerState = params.routerState;
    if (params.initEventsNumber) {
      this.initEventsNumber = params.initEventsNumber;
    }
  }

  public hybridStatusEventHandler(servicesStatuses: Array<IServiceStatus>): void {
    this.status = {
      status: filterAndGetCssStatus(this.HybridServicesClusterStatesService, servicesStatuses, this.service),
      text: filterAndGetTxtStatus(servicesStatuses, this.service),
      routerState: this.routerState,
    };
    this.active = filterAndGetEnabledService(servicesStatuses, this.service);
    this.setupMode = !this.active;
    this.setLoading();
  }

  protected setLoading(): void {
    this.initEventsNumber === 0 ? this.loading = false : this.initEventsNumber--;
  }
}
