import { ILicenseUsage, ISubscription } from 'modules/core/users/userAdd/assignable-services/shared/license-usage-util.interfaces';
import { IUserEntitlementRequestItem } from 'modules/core/users/shared/onboard.interfaces';
import { IHybridServices } from 'modules/core/users/userAdd/hybrid-services-entitlements-panel/hybrid-services-entitlements-panel.component';

export interface IAutoAssignTemplateData {
  LICENSE: {
    [key: string]: {
      isSelected: boolean;
      isDisabled: boolean;
      license: ILicenseUsage;
    };
  };
  SUBSCRIPTION: {
    [key: string]: {
      showContent: boolean;
    };
  };
  USER_ENTITLEMENTS_PAYLOAD: IUserEntitlementRequestItem[];
  hybridServices: IHybridServices;
  subscriptions: ISubscription[];
}
