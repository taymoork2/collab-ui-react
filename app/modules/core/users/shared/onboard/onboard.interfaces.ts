// notes:
// - as of 2017-11-20, the following entries correlate to 'serviceId' properties for each entry in
//   responses from the '/organizations/{orgId}/services' endpoint
export enum UserEntitlementName {
  CISCO_UC = 'ciscoUC',
  CLOUD_CONTACT_CENTER = 'cloudContactCenter',
  CLOUD_CONTACT_CENTER_DIGITAL = 'cloudContactCenterDigital',
  CLOUD_MEETINGS = 'cloudMeetings',
  CONTACT_CENTER_CONTEXT = 'contactCenterContext',
  MESSENGER_INTEROP = 'messengerInterop',
  SPARK = 'spark',
  SPARK_ADMIN = 'sparkAdmin',
  SPARK_HYBRID_IMP_INTEROP = 'sparkHybridImpInterop',
  SPARK_TEST_ACCOUNT = 'sparkTestAccount',
  SQUARED_CALL_INITIATION = 'squaredCallInitiation',
  SQUARED_FUSION_CAL = 'squaredFusionCal',
  SQUARED_FUSION_EC = 'squaredFusionEC',
  SQUARED_FUSION_GCAL = 'squaredFusionGCal',
  SQUARED_FUSION_MEDIA = 'squaredFusionMedia',
  SQUARED_FUSION_MGMT = 'squaredFusionMgmt',
  SQUARED_FUSION_UC = 'squaredFusionUC',
  SQUARED_ON_BEHALF_OF = 'squaredOnBehalfOf',
  SQUARED_ROOM_MODERATION = 'squaredRoomModeration',
  SQUARED_SYNC_UP = 'squaredSyncUp',
  WEBEX_SQUARED = 'webExSquared',
}

export enum UserEntitlementState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum LicenseChangeOperation {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

export enum OnboardMethod {
  API = 'API',
  MANUAL = 'MANUAL',
  CSV = 'CSV',
  DIRSYNC = 'DIRSYNC',
  CONVERT = 'CONVERT',
  OTHER = 'OTHER',
}

export interface IUserEntitlementRequestItem {
  entitlementName: UserEntitlementName;
  entitlementState: UserEntitlementState;
}

export interface ILicenseResponseItem {
  id: string;
  idOperation: LicenseChangeOperation;
}

export interface ILicenseRequestItem extends ILicenseResponseItem {
  properties: Object;
}

export interface IAutoAssignTemplateRequestPayload {
  name: string;
  licenses: ILicenseRequestItem[];
  userEntitlements: IUserEntitlementRequestItem[];
}

interface IErrorInfo {
  errorCode: number;
  description: string;
}

export interface IUserStatusResponse {
  email: string;
  uuid?: string;
  displayName?: string;
  name?: string;
  status?: number;
  httpStatus?: number;
  message?: string;
  emailMessageId?: string;
  errorList?: IErrorInfo[];
}

export interface IUserProvisionStatusResponse extends IUserStatusResponse {
  entitled?: string[];
  unentitled?: string[];
  roles?: string[];
}

export interface IConvertUserEntity {
  userName: string;
  assignedDn?: any;
  externalNumber?: any;
}

export interface IUserNameAndEmail {
  address: string;
  name: string;
}

export interface IMigrateUsersResponse {
  userResponse: IUserStatusResponse[];
}

export interface IUpdateUsersResponse {
  userResponse: IUserProvisionStatusResponse[];
}

export interface IOnboardUsersResponse {
  userResponse: IUserProvisionStatusResponse[];
}

export type IOnboardedUserResult = IUserProvisionStatusResponse;

export interface IParsedOnboardedUserResult {
  email: string;
  message?: string;
  alertType?: 'success' | 'warning' | 'danger';
  warningMsg?: string;
  errorMsg?: string;
  httpStatus?: number;
}

export interface IParsedOnboardedUserResponse {
  resultList: IParsedOnboardedUserResult[];
  numUpdatedUsers: number;
  numAddedUsers: number;
}

export interface IOnboardedUsersResultsErrorsAndWarnings {
  resultList: IParsedOnboardedUserResult[];
  errors: string[];
  warnings: string[];
}

export interface IOnboardedUsersAggregateResult {
  results: IOnboardedUsersResultsErrorsAndWarnings;
  numUpdatedUsers: number;
  numAddedUsers: number;
}

export interface IOnboardedUsersAnalyticsProperties {
  numberOfErrors: number;
  usersAdded: number;
  usersUpdated: number;
  servicesSelected: string[];
}
