import { IAssignableLicenseCheckboxState, ISubscription } from 'modules/core/users/userAdd/assignable-services/shared/license-usage-util.interfaces';
import { ILicenseResponseItem, IUserEntitlementRequestItem } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { IHybridServices } from 'modules/core/users/userAdd/hybrid-services-entitlements-panel/hybrid-services-entitlements-panel.service';
import { ICrCheckboxItemState } from 'modules/core/shared/cr-checkbox-item/cr-checkbox-item.component';

export interface ILicensesViewState {
  [key: string]: IAssignableLicenseCheckboxState;
}

export interface IUserEntitlementsViewState {
  [key: string]: ICrCheckboxItemState;
}

export interface IAutoAssignTemplateDataUserChangesData {
  LICENSE?: ILicensesViewState;
  USER_ENTITLEMENT?: IUserEntitlementsViewState;
}

export interface IAutoAssignTemplateDataViewData extends IAutoAssignTemplateDataUserChangesData {
  SUBSCRIPTION?: {
    [key: string]: {
      showContent: boolean;
    };
  };
}

export interface IAutoAssignTemplateData {
  userChangesData?: IAutoAssignTemplateDataUserChangesData;
  viewData: IAutoAssignTemplateDataViewData;
  otherData: {
    hybridServices?: IHybridServices;
  };
  apiData: {
    subscriptions?: ISubscription[];
    template?: IAutoAssignTemplateResponse;
  };
}

export interface IAutoAssignTemplateResponse {
  name: string;
  templateId: string;
  userEntitlements: IUserEntitlementRequestItem[];
  licenses: ILicenseResponseItem[];
}
