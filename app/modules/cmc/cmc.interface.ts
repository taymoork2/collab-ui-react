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

export interface ICmcOrgStatusResponse {
  status: string;
  details?: {
    providers: {mobileProvider: ICmcMobileProvider, ucProvider: ICmcProvider},
  };
  issues?: {code: number, message: string}[];
}
