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

export interface IUserEntitlementRequestItem {
  entitlementName: UserEntitlementName;
  entitlementState: UserEntitlementState;
  properties: Object;
}

export interface ILicenseRequestItem {
  id: string;
  idOperation: LicenseChangeOperation;
  properties: Object;
}

export interface IAutoAssignTemplateRequestPayload {
  name: string;
  licenses: ILicenseRequestItem[];
  userEntitlements: IUserEntitlementRequestItem[];
}
