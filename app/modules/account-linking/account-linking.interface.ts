
export interface IACSiteInfo {
  linkedSiteUrl: string;
  isSiteAdmin?: boolean;
  linkingMode?: LinkingMode;
  linkingModeDisplay?: string;
  linkingStatus?: IACLinkingStatus;
  domains?: string[];
  webexInfo: IACWebexPromises;
  supportAgreementLinkingMode?: boolean;
}

export interface IACWebexPromises {
  siteInfoPromise: ng.IPromise<IACWebexSiteinfoResponse>;
  ciAccountSyncPromise: ng.IPromise<IACLinkingStatus>;
  domainsPromise: ng.IPromise<any>;
}

export interface IACLinkingStatus {
  accountsLinked?: number;
  totalWebExAccounts?: number;
}

export interface IACWebexSiteinfoResponse {
  accountLinkingMode: LinkingMode | '';
  enable: boolean;
  linkAllUsers: boolean;
  supportAgreementLinkingMode: boolean;
  trustedDomains: string[];
}

export interface IACWebexSiteError {
  error: any;
}

export enum LinkingOriginator {
  Banner = 'Banner',
  Menu = 'Menu',
}

export enum LinkingOperation {
  New = 'New',
  Modify = 'Modify',
}

export interface IGotoWebex {
  siteUrl: string;
  toSiteListPage: boolean;
}

export enum LinkingMode {
  AUTO_AGREEMENT = 'auto_agreement',
  AUTO_VERIFY_DOMAIN = 'auto_verifiedDomain',
  MANUAL = 'manual',
  UNSET = 'unset',
}
