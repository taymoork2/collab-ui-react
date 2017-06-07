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

export interface ICmcUserData {
  mobileNumber: string;
  entitled: boolean;
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
