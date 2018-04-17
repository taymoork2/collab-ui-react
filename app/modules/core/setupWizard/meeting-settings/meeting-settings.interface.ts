export interface IWebExSite {
  siteUrl: string;
  timezone?: string | object;
  centerType: string;
  quantity?: number;
  audioPackageDisplay?: string;
  setupType?: string;
  isCIUnifiedSite?: boolean;
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

export interface ICenterDetails {
  serviceName: string;
  quantity: number;
}

export interface IConferenceLicense  extends IPendingLicense {
  billingServiceId: string;
  capacity: number;
  siteId?: string;
  trialId: string;
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
  capacity?: number;
}

export interface ICCASPLicense extends IPendingLicense {
  ccaspPartnerName: string;
  ccaspSubscriptionId: string;
}

export interface ITSPLicense extends IPendingLicense {
  tspPartnerName: string;
}

export interface ICCASPInfo {
  partnerName: string;
  subscriptionId: string;
}
