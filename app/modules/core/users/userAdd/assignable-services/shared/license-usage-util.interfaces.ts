import { OfferName } from 'modules/core/shared';

export enum AssignableServicesItemCategory {
  LICENSE = 'LICENSE',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum LicenseStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED',
}

export interface ILicenseUsage {
  billingServiceId: string;
  licenseId: string;
  offerName: OfferName;
  siteUrl: string;
  status: LicenseStatus;
}

export interface ILicenseUsageMap {
  [key: string]: ILicenseUsage;
}

export interface ISubscription {
  subscriptionId: string;
  licenses: ILicenseUsage[];
}

export interface IAssignableLicenseCheckboxState {
  isSelected: boolean;
  isDisabled: boolean;
  license: ILicenseUsage;
}

export interface IAssignableItemChange {
  itemId: string;
  itemCategory: AssignableServicesItemCategory;
  item: IAssignableLicenseCheckboxState;
}

export interface IOnUpdateParam {
  $event: IAssignableItemChange;
}
