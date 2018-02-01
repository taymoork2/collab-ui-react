import { IAssignableLicenseCheckboxState, ISubscription } from 'modules/core/users/userAdd/assignable-services/shared/license-usage-util.interfaces';
import { ILicenseResponseItem, IUserEntitlementRequestItem } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { IHybridServices } from 'modules/core/users/userAdd/hybrid-services-entitlements-panel/hybrid-services-entitlements-panel.service';
import { ICrCheckboxItemState } from 'modules/core/users/shared/cr-checkbox-item/cr-checkbox-item.component';

export interface IUserEntitlementsViewState {
  [key: string]: ICrCheckboxItemState;
}

export interface IAutoAssignTemplateData {
  viewData: {
    LICENSE: {
      [key: string]: IAssignableLicenseCheckboxState;
    };
    SUBSCRIPTION: {
      [key: string]: {
        showContent: boolean;
      };
    };
    USER_ENTITLEMENT: IUserEntitlementsViewState;
  };
  otherData: {
    hybridServices: IHybridServices;
  };
  apiData: {
    subscriptions: ISubscription[];
    template: IAutoAssignTemplateResponse;
  };
}

export interface IAutoAssignTemplateResponse {
  name: string;
  templateId: string;
  userEntitlements: IUserEntitlementRequestItem[];
  licenses: ILicenseResponseItem[];
}
