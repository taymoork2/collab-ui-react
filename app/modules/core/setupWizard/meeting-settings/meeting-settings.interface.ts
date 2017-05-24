export interface IWebExSite {
  name: string;
  timeZone?: string;
  licenseCount?: number;
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
  features: Array<string>;
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
