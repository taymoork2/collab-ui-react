import { Member } from 'modules/huron/members';

export const PLACE = 'PLACE';
export const USER = 'USER';

export interface IMemberData extends ng.resource.IResource<IMemberData> {
  memberId: string;
  deviceIds: string[];
  type: string;
}

export interface IPagingGroup extends ng.resource.IResource<IPagingGroup> {
  groupId?: string;
  name: string;
  extension: string;
  members: Array<IMemberData>;
}

export interface IMemberWithPicture {
  member: Member;
  picturePath: string;
}
