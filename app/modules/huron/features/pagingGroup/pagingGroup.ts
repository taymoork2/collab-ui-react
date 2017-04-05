import { Member } from 'modules/huron/members';

export const PLACE = 'PLACE';
export const USER = 'USER';
export const PUBLIC = 'PUBLIC';
export const MEMBERS_ONLY = 'MEMBERS_ONLY';
export const CUSTOM = 'CUSTOM';

export interface IMemberData extends ng.resource.IResource<IMemberData> {
  memberId: string;
  deviceIds?: string[] | undefined;
  type: string;
}

export interface IInitiatorData extends ng.resource.IResource<IInitiatorData> {
  initiatorId: string;
  type: string;
}

export interface IPagingGroup extends ng.resource.IResource<IPagingGroup> {
  groupId?: string;
  name: string;
  extension: string;
  extensionUUID?: string;
  members: Array<IMemberData>;
  initiatorType?: string | undefined;
  initiators?: Array<IInitiatorData> | undefined;
}

export interface IMemberWithPicture {
  member: Member;
  picturePath: string;
}

export interface INumberData extends ng.resource.IResource<INumberData> {
  extension: string;
  extensionUUID?: string;
}
