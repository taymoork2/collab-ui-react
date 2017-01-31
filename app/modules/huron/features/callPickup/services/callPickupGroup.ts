import { Member } from 'modules/huron/members';

export const PLACE = 'PLACE';
export const USER = 'USER';

export interface IPickupGroup extends ng.resource.IResource<IPickupGroup> {
  name: string;
  members: Array<string>;
  numbers: Array<any>;
  notificationTimer: number | undefined;
  playSound: boolean | true;
  displayCallingPartyId: boolean | true;
  displayCalledPartyId: boolean | true;
}

export interface IMemberNumber extends ng.resource.IResource<IMemberNumber> {
  uuid: string;
  internal: string;
  external?: string | undefined;
  siteTosite: string;
  incomingCallMaximum: number;
  primary: boolean | undefined;
  shared: boolean;
  url: string;
}

export interface IMember {
  member: Member;
  picturePath: string;
  checkboxes: Array<ICardMemberCheckbox>;
  saveNumbers: Array<ICallPickupNumbers>;
}

export interface ICardMemberCheckbox {
    label: string;
    sublabel?: string;
    value: boolean;
    numberUuid: string;
}

export interface ICallPickupNumbers {
  uuid: string;
  internalNumber: string;
}
