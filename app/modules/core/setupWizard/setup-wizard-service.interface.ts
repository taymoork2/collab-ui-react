export interface IPendingOrderSubscription {
  duration?: number;
  externalSubscriptionId?: string;
  gracePeriod?: number;
  licenses?: any;
  orderingTool?: string;
  pendingServiceOrderUUID?: string | undefined;
  status?: string;
  subscriptionId?: string;
  trialDuration?: number;
}

export interface IPendingLicense {
  licenseId: string;
  offerName: string;
  masterOfferName: string;
  licenseType: string;
  features: string[];
  volume: number;
  isTrial: boolean;
  status: string;
}
