import { IServiceDescription } from 'modules/hercules/services/service-descriptor.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { IUserEntitlementRequestItem } from 'modules/core/users/shared/onboard/onboard.interfaces';

interface IExtendedServiceDescription extends IServiceDescription {
  entitled?: boolean;
}

export interface IHybridServices {
  calendarEntitled: boolean;
  selectedCalendarType: HybridServiceId | null;
  hybridMessage: IExtendedServiceDescription | null;
  calendarExchangeOrOffice365: IExtendedServiceDescription | null;
  calendarGoogle: IExtendedServiceDescription | null;
  callServiceAware: IExtendedServiceDescription | null;
  callServiceConnect: IExtendedServiceDescription | null;
  notSetupText: string;
  hasHybridMessageService: Function;
  hasCalendarService: Function;
  hasCallService: Function;
  setSelectedCalendarEntitlement: Function;
}

export class HybridServicesEntitlementsPanelService {

  /* @ngInject */
  constructor(
    private OnboardService,
  ) {}

  public getEntitlements(hybridServices: IHybridServices): IUserEntitlementRequestItem[] {
    let entitlements: IUserEntitlementRequestItem[] = [];
    if (hybridServices.calendarEntitled) {
      hybridServices.setSelectedCalendarEntitlement();
      if (_.get(hybridServices, 'calendarExchangeOrOffice365.entitled')) {
        entitlements.push(<IUserEntitlementRequestItem>{ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionCal' });
      } else if (_.get(hybridServices, 'calendarGoogle.entitled')) {
        entitlements.push(<IUserEntitlementRequestItem>{ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionGCal' });
      }
    } else {
      hybridServices.selectedCalendarType = null;
    }
    if (!this.hasHuronCallEntitlement() && _.get(hybridServices, 'callServiceAware.entitled')) {
      entitlements.push(<IUserEntitlementRequestItem>{ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionUC' });
      if (hybridServices.callServiceConnect && hybridServices.callServiceConnect.entitled) {
        entitlements.push(<IUserEntitlementRequestItem>{ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionEC' });
      }
    } else {
      if (hybridServices.callServiceAware) {
        hybridServices.callServiceAware.entitled = false;
      }
      if (hybridServices.callServiceConnect) {
        hybridServices.callServiceConnect.entitled = false;
      }
    }
    if (_.get(hybridServices, 'hybridMessage.entitled')) {
      entitlements.push(<IUserEntitlementRequestItem>{ entitlementState: 'ACTIVE', entitlementName: 'sparkHybridImpInterop' });
    }

    return entitlements;
  }

  public hasHuronCallEntitlement(): boolean {
    return this.OnboardService.huronCallEntitlement;
  }
}
