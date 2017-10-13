import { Member, MemberType } from 'modules/huron/members';
import { ICallFeatureMember, CallFeatureMember } from 'modules/call/features/shared/call-feature-members';

export const PLACE = 'PLACE';
export const USER = 'USER';
export const PUBLIC = 'PUBLIC';
export const MEMBERS_ONLY = 'MEMBERS_ONLY';
export const CUSTOM = 'CUSTOM';

interface IBasePagingGroup {
  groupId?: string;
  name: string;
}

export interface IRPagingGroupListItem extends IBasePagingGroup {
  memberCount: number;
}

export interface IPagingGroupListItem extends IRPagingGroupListItem {
  extension?: IPagingGroupNumber;
}

export class PagingGroupListItem implements IPagingGroupListItem {
  public groupId?: string;
  public name: string;
  public memberCount: number;
  public extension?: IPagingGroupNumber;

  constructor(pagingGroupListItem: IRPagingGroupListItem = {
    groupId: undefined,
    name: '',
    memberCount: 0,
  }) {
    this.groupId = pagingGroupListItem.groupId;
    this.name = pagingGroupListItem.name;
    this.memberCount = pagingGroupListItem.memberCount;
  }
}

export interface IRPagingGroup extends IBasePagingGroup {
  extension?: string;
  members: IMemberData[];
  initiatorType: string;
  initiators: IInitiatorData[];
}

export interface IPagingGroup extends IBasePagingGroup {
  extension?: string;
  members: ICallFeatureMember[];
  initiatorType: string;
  initiators: ICallFeatureMember[];
}

export class PagingGroup implements IPagingGroup {
  public groupId?: string;
  public name: string;
  public extension?: string;
  public members: ICallFeatureMember[];
  public initiatorType: string;
  public initiators: ICallFeatureMember[];

  constructor(pagingGroup: IRPagingGroup = {
    groupId: undefined,
    name: '',
    extension: undefined,
    members: [],
    initiatorType: CUSTOM,
    initiators: [],
  }) {
    this.groupId = pagingGroup.groupId;
    this.name = pagingGroup.name;
    this.extension = pagingGroup.extension;
    this.members = _.map(pagingGroup.members, member => {
      const callFeatureMember = new CallFeatureMember();
      callFeatureMember.uuid = member.memberId;
      callFeatureMember.type = member.type === USER ? MemberType.USER_REAL_USER : MemberType.USER_PLACE;
      return callFeatureMember;
    });
    this.initiatorType = pagingGroup.initiatorType;
    this.initiators = _.map(pagingGroup.initiators, initiator => {
      const callFeatureMember = new CallFeatureMember();
      callFeatureMember.uuid = initiator.initiatorId;
      callFeatureMember.type = initiator.type === USER ? MemberType.USER_REAL_USER : MemberType.USER_PLACE;
      return callFeatureMember;
    });
  }
}

export interface IMemberWithPicture {
  member: Member;
  picturePath: string;
}

export interface INumberData {
  extension: any | undefined;
  extensionUUID: string | undefined;
}

export interface IRPagingGroupNumber {
  uuid: string;
  type: string;
  number: string;
}

export interface IPagingGroupNumber extends IRPagingGroupNumber {}

export class PagingGroupNumber implements IPagingGroupNumber {
  public uuid: string;
  public type: string;
  public number: string;

  constructor(pagingGroupNumber: IRPagingGroupNumber = {
    uuid: '',
    type: '',
    number: '',
  }) {
    this.uuid = pagingGroupNumber.uuid;
    this.type = pagingGroupNumber.type;
    this.number = pagingGroupNumber.number;
  }
}

export interface IMemberData {
  memberId: string;
  deviceIds?: string[] | undefined;
  type: string;
}

export interface IInitiatorData {
  initiatorId: string;
  type: string;
}
