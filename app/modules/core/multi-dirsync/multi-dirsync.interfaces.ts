export interface IDirectoryConnector {
  isInService: boolean;
  name: string;
}

export interface IDirectorySync {
  serviceMode: String;
  siteStatus: String;
  domains: IDomain[];
  connectors: IDirectoryConnector[];
}

export interface IDomain {
  domainName: string;
}
