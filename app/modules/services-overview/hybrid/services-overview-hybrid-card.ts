import { ICardParams, ServicesOverviewCard } from '../shared/services-overview-card';
import { IServiceStatusWithSetup } from 'modules/hercules/services/hybrid-services-cluster.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

export interface IHybridCardParams extends ICardParams {
  serviceId: HybridServiceId;
  routerState: string;
}

export function filterAndGetCssStatus(services: IServiceStatusWithSetup[], serviceId: HybridServiceId): string | undefined {
  const service = _.find(services, (service) => service.serviceId === serviceId);
  return service && service.cssClass || undefined;
}

export function filterAndGetTxtStatus(services: IServiceStatusWithSetup[], serviceId: HybridServiceId): string | undefined {
  const IServiceStatusToTxt = {
    operational: 'servicesOverview.cardStatus.operational',
    impaired: 'servicesOverview.cardStatus.impaired',
    outage: 'servicesOverview.cardStatus.outage',
    unknown: 'servicesOverview.cardStatus.unknown',
    setupNotComplete: 'servicesOverview.cardStatus.setupNotComplete',
  };
  const service = _.find(services, (service) => service.serviceId === serviceId);
  if (service) {
    return IServiceStatusToTxt[service.status] || IServiceStatusToTxt['unknown'];
  }
  return undefined;
}

export function filterAndGetEnabledService(statuses: IServiceStatusWithSetup[], serviceId: HybridServiceId): boolean {
  const service = _.find(statuses, (service) => service.serviceId === serviceId);
  return service && service.setup;
}

export abstract class ServicesOverviewHybridCard extends ServicesOverviewCard {
  private serviceId: HybridServiceId;
  private routerState: string;

  public constructor(
    params: IHybridCardParams,
  ) {
    super(params);
    this.serviceId = params.serviceId;
    this.routerState = params.routerState;
  }

  public hybridStatusEventHandler(servicesStatuses: IServiceStatusWithSetup[]): void {
    this.status = {
      status: filterAndGetCssStatus(servicesStatuses, this.serviceId),
      text: filterAndGetTxtStatus(servicesStatuses, this.serviceId),
      routerState: this.routerState,
    };
    this.active = filterAndGetEnabledService(servicesStatuses, this.serviceId);
    this.setupMode = !this.active;
    this.loading = false;
  }
}
