import { IUser } from 'modules/core/auth/user/user';

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

export interface ICmcStatusResponse {
  status: string;
  issues?: ICmcIssue[];
}

export class ICmcUserData {
  public mobileNumber: string;
  public entitled: boolean;

  constructor(mobilenumber: string,
              entitled: boolean) {
    this.mobileNumber = mobilenumber;
    this.entitled = entitled;
  }
}

export interface ICmcUser extends IUser {
  phoneNumbers?: Array<any>;
}

export interface ICmcOrgStatusResponse extends ICmcStatusResponse {
  details?: {
    providers: {mobileProvider: ICmcMobileProvider, ucProvider: ICmcProvider},
  };
}

export interface ICmcUserStatusResponse extends ICmcStatusResponse {
}

export interface ICmcUserStatus {
  userId: string;
  state?: string;
  serviceId?: string;
  orgId?: string;
  lastStatusUpdate?: string;
  lastStateChange?: string;
  entitled?: string;
}

export interface ICmcUserStatusInfoResponse {
  userStatuses: Array<ICmcUserStatus>;
  paging: {
    next: string;
  };
}
