import { IServiceDescription } from 'modules/hercules/services/service-descriptor.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { IUserEntitlementRequestItem, UserEntitlementName, UserEntitlementState } from 'modules/core/users/shared/onboard/onboard.interfaces';

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

  public getEntitlements(hybridServices: IHybridServices, options: { allowRemove?: boolean } = {}): IUserEntitlementRequestItem[] {
    let entitlements: IUserEntitlementRequestItem[] = [];
    const { allowRemove = false } = options;
    let entitlementName, entitlementState;

    if (hybridServices.calendarEntitled) {
      hybridServices.setSelectedCalendarEntitlement();
      if (_.has(hybridServices, 'calendarExchangeOrOffice365.entitled')) {
        entitlementName = UserEntitlementName.SQUARED_FUSION_CAL;
        entitlementState = _.get(hybridServices, 'calendarExchangeOrOffice365.entitled');
        entitlements.push(this.OnboardService.toEntitlementItem(entitlementName, entitlementState));
      }
      if (_.has(hybridServices, 'calendarGoogle.entitled')) {
        entitlementName = UserEntitlementName.SQUARED_FUSION_GCAL;
        entitlementState = _.get(hybridServices, 'calendarGoogle.entitled');
        entitlements.push(this.OnboardService.toEntitlementItem(entitlementName, entitlementState));
      }
    } else {
      hybridServices.selectedCalendarType = null;
    }
    if (!this.hasHuronCallEntitlement() && _.has(hybridServices, 'callServiceAware.entitled')) {
      entitlementName = UserEntitlementName.SQUARED_FUSION_UC;
      entitlementState = _.get(hybridServices, 'callServiceAware.entitled');
      entitlements.push(this.OnboardService.toEntitlementItem(entitlementName, entitlementState));
      if (_.has(hybridServices, 'callServiceConnect.entitled')) {
        entitlementName = UserEntitlementName.SQUARED_FUSION_EC;
        entitlementState = _.get(hybridServices, 'callServiceConnect.entitled');
        entitlements.push(this.OnboardService.toEntitlementItem(entitlementName, entitlementState));
      }
    } else {
      if (hybridServices.callServiceAware) {
        hybridServices.callServiceAware.entitled = false;
      }
      if (hybridServices.callServiceConnect) {
        hybridServices.callServiceConnect.entitled = false;
      }
    }
    if (_.has(hybridServices, 'hybridMessage.entitled')) {
      entitlementName = UserEntitlementName.SPARK_HYBRID_IMP_INTEROP,
      entitlementState = _.get(hybridServices, 'hybridMessage.entitled'),
      entitlements.push(this.OnboardService.toEntitlementItem(entitlementName, entitlementState));
    }

    // disallow removing entitlements as-needed
    if (!allowRemove) {
      entitlements = _.reject(entitlements, { entitlementState: UserEntitlementState.INACTIVE });
    }

    return entitlements;
  }

  public hasHuronCallEntitlement(): boolean {
    return this.OnboardService.huronCallEntitlement;
  }
}
