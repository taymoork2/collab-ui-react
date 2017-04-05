export interface ISubscription {
  changeplanOverride?: any;
  internalSubscriptionId?: string;
  isTrial: boolean;
  isOnline: boolean;
  licenses: Array<IOfferData>;
  name?: string;
  numSubscriptions: number;
  productInstanceId?: string;
  quantity?: number;
  subscriptionId?: string;
  upgradeTrialUrl?: string;
  viewAll: boolean;
}

export interface ISubscriptionCategory {
  label?: string;
  offers: Array<IOfferData>;
  offerWrapper: Array<IOfferWrapper>;
}

export interface IOfferWrapper {
  offers: Array<IOfferData>;
  siteUrl?: string;
  type?: string;
}

export interface IOfferData {
  class?: string;
  id: string;
  isCI?: any;
  licenseId: string;
  licenseType: string;
  licenseModel: string;
  offerName: string;
  siteUrl?: string;
  tooltip?: string;
  usage: number;
  volume: number;
}
