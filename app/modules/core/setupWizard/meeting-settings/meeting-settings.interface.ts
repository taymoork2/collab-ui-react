export interface IWebExSite {
  siteUrl: string;
  timezone?: string | object;
  centerType: string;
  quantity?: number;
  audioPackageDisplay?: string;
  setupType?: string;
}

export interface IExistingWebExTrialSite extends IWebExSite {
  keepExistingSite: boolean;
}

export interface IWebexSiteDetail {
  siteUrl: string;
  timezone: string;
  centerType: string;
  quantity: number;
}

export enum SiteErrorType {
  URL = 'URL',
  TIME_ZONE = 'TIME_ZONE',
  USER_MGMT = 'USR_MGMT',
}

export interface ISiteNameError {
  isError: boolean;
  errorMsg: string;
  errorType?: SiteErrorType;
}

export interface IConferenceService {
  isCustomerPartner: boolean;
  label: string;
  license: IConferenceLicense;
}

export interface IConferenceLicense {
  billingServiceId: string;
  capacity: number;
  features: string[];
  siteId?: string;
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

export interface IWebexLicencesPayload {
  provisionOrder: boolean;
  sendCustomerEmail?: boolean;
  serviceOrderUUID?: string | null;
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
  externalSubscriptionId: string;
  gracePeriod?: number;
  licenses?: any;
  orderingTool?: string;
  pendingServiceOrderUUID?: string;
  status?: string;
  subscriptionId: string;
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

export interface ICCASPInfo {
  partnerName: string;
  subscriptionId: string;
}
