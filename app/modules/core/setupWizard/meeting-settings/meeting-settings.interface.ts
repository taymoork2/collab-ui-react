export interface IWebExSite {
  name: string;
  timeZone?: string;
  timeZoneId?: string | object;
  centerType: string;
  licenseCount?: number;
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
  serviceOrderUUID: string | null;
  webexProvisioningParams: IWebexProvisioningParams;
}

export interface IWebexProvisioningParams {
  webexSiteDetailsList: IWebexSiteDetail[];
  audioPartnerName: string | null;
}
