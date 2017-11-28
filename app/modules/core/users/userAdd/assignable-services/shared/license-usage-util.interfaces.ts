import { OfferNameEnum } from 'modules/core/shared';

export enum AssignableServicesItemCategory {
  LICENSE = 'LICENSE',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export interface ILicenseUsage {
  billingServiceId: string;
  licenseId: string;
  offerName: OfferNameEnum;
  siteUrl: string;
}

export interface ISubscription {
  subscriptionId: string;
  licenses: ILicenseUsage[];
}
