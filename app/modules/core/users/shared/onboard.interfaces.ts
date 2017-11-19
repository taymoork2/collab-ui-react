// notes:
// - as of 2017-11-20, the following entries correlate to 'serviceId' properties for each entry in
//   responses from the '/organizations/{orgId}/services' endpoint
export type UserEntitlementName = 'ciscoUC' |
 'cloudContactCenter' |
 'cloudContactCenterDigital' |
 'cloudMeetings' |
 'contactCenterContext' |
 'messengerInterop' |
 'spark' |
 'sparkAdmin' |
 'sparkTestAccount' |
 'squaredCallInitiation' |
 'squaredFusionCal' |
 'squaredFusionEC' |
 'squaredFusionGCal' |
 'squaredFusionMedia' |
 'squaredFusionMgmt' |
 'squaredFusionUC' |
 'squaredOnBehalfOf' |
 'squaredRoomModeration' |
 'squaredSyncUp' |
 'webExSquared';
export type UserEntitlementState = 'ACTIVE' | 'PENDING' | 'DISABLED';
export type LicenseChangeOperation = 'ADD' | 'REMOVE';

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
