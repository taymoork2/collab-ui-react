// TODO(brspence): confirm enum values and interface required/optional properties

export enum PolicyAction {
  ALLOW = 'Allow',
  DENY = 'Deny',
}

export enum PolicyType {
  CUSTOM = 'custom',
  DEFAULT = 'default',
}

export interface IApplicationUsage {
  id: string;
  orgId: string;
  policyId?: string;
  appId: string;
  appName: string;
  appClientId: string;
  appPrivacyUrl: string;
  appCompanyUrl: string;
  appContactName: string;
  appContactEmail: string;
  appUserAdoption: number;
  policyAction: PolicyAction;
  appCreated: string;
}

export interface IApplicationUsageList {
  items: IApplicationUsage[];
}

export interface IGlobalPolicy {
  id: string;
  orgId: string;
  name: string;
  type: PolicyType;
  action: PolicyAction;
}

export interface ICustomPolicy extends IGlobalPolicy {
  appId: string;
  personIds?: string[];
}

export interface IApplicationAdoptedUsers {
  clientId: string;
  emails: string[];
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}
export interface IListOptions {
  sortBy?: string;
  sortOrder?: SortOrder;
  searchStr?: string;
  start?: number;
  count?: number;
}

export interface IIntegrationsManagementService {
  listIntegrations(options?: IListOptions): ng.IPromise<IApplicationUsage[]>;
  getIntegration(appId: string): ng.IPromise<IApplicationUsage>;
  getGlobalAccessPolicy(): ng.IPromise<IGlobalPolicy | undefined>;
  createGlobalAccessPolicy(action: PolicyAction): ng.IPromise<void>;
  updateGlobalAccessPolicy(id: string, action: PolicyAction): ng.IPromise<void>;
  getCustomPolicy(id: string): ng.IPromise<ICustomPolicy>;
  createCustomPolicy(appId: string, action: PolicyAction, userIds?: string[]): ng.IPromise<void>;
  updateCustomPolicy(id: string, appId: string, action: PolicyAction, userIds?: string[]): ng.IPromise<void>;
  deleteCustomPolicy(id: string): ng.IPromise<void>;
  hasCustomPolicyByAction(action: PolicyAction): ng.IPromise<boolean>;
  revokeTokensForIntegration(clientId: string): ng.IPromise<void>;
  listAdoptedUsersForIntegration(clientId: string): ng.IPromise<string[]>;
}
