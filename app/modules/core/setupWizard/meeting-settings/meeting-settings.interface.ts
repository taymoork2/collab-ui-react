export interface IWebExSite {
  siteUrl: string;
  timezone?: string | object;
  centerType: string;
  quantity?: number;
  audioPackageDisplay?: string;
  isTransferSite?: boolean;
  keepExistingSite?: boolean;
}

export interface IWebexSiteDetail {
  siteUrl: string;
  timezone: string;
  centerType: string;
  quantity: number;
}

export interface ISiteNameError {
  isError: boolean;
  errorMsg: string;
}

export interface IConferenceService {
  isCustomerPartner: boolean;
  label: string;
  license: IConferenceLicense;
}

export interface IConferenceLicense {
  features: string[];
  isTrial: boolean;
  trialId: string;
  licenseId: string;
  licenseType: string;
  offerName: string;
  status: string;
  volume: number;
  siteUrl?: string;
  isCIUnifiedSite?: true;
  licenseModel: string;
}

export interface IExistingTrialSites extends IWebExSite {
  keepExistingSite: boolean;
}

export interface IWebexLicencesPayload {
  provisionOrder: boolean;
  sendCustomerEmail?: boolean;
  serviceOrderUUID: string | null;
  webexProvisioningParams?: IWebexProvisioningParams;
}

export interface IWebexProvisioningParams {
  webexSiteDetailsList: IWebexSiteDetail[];
  audioPartnerName: string | null;
}

export interface IWebExProvisioningData {
  webexLicencesPayload: IWebexLicencesPayload;
  subscriptionId: string;
}

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
