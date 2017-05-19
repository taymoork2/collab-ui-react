export interface ICmcProvider {
  id: string;
  name: string;
  description: string;
  address: string;
  authName: string;
  url: string;
}

export interface ICmcMobileProvider extends ICmcProvider {
  passthroughHeaders?: string[];
}

export interface ICmcIssue {
  code: number;
  message: string;
}

export interface ICmcOrgStatusResponse {
  status: string;
  details?: {
    providers: {mobileProvider: ICmcMobileProvider, ucProvider: ICmcProvider},
  };
  issues?: ICmcIssue[];
}
