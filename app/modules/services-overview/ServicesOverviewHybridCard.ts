import { ICardParams, ServicesOverviewCard } from './ServicesOverviewCard';

export interface IHybridCardParams extends ICardParams {
  service: string;
  routerState: string;
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

export function filterAndGetCssStatus(FusionClusterStatesService, services: Array<IServiceStatus>, serviceId: string): string | undefined {
  let service = _.find(services, (service) => service.serviceId === serviceId);
  if (service) {
    return FusionClusterStatesService.getStatusIndicatorCSSClass(service.status);
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

  public constructor(
    params: IHybridCardParams,
    private FusionClusterStatesService
  ) {
    super(params);
    this.service = params.service;
    this.routerState = params.routerState;
  }

  public hybridStatusEventHandler(servicesStatuses: Array<IServiceStatus>): void {
    this.status = {
      status: filterAndGetCssStatus(this.FusionClusterStatesService, servicesStatuses, this.service),
      text: filterAndGetTxtStatus(servicesStatuses, this.service),
      routerState: this.routerState,
    };
    this.active = filterAndGetEnabledService(servicesStatuses, this.service);
    this.loading = false;
  }
}
