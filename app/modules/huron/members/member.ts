import { Line } from 'modules/huron/lines/services/line';

export enum MemberNumberType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum MemberType {
  USER_REAL_USER = 'user',
  USER_PLACE = 'place',
  USER_GROUP = 'group',
}

export interface IMember {
  uuid: string;
  type: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  displayName?: string;
  numbers: Line[];
}

export class Member implements IMember {
  public uuid: string;
  public type: string;
  public firstName?: string;
  public lastName?: string;
  public userName?: string;
  public displayName?: string;
  public numbers: Line[];

  constructor(member: IMember = {
    uuid: '',
    type: '',
    firstName: undefined,
    lastName: undefined,
    userName: undefined,
    displayName: undefined,
    numbers: [],
  }) {
    this.uuid = member.uuid;
    this.type = member.type;
    this.firstName = member.firstName;
    this.lastName = member.lastName;
    this.userName = member.userName;
    this.displayName = member.displayName;
    this.numbers = member.numbers;
  }
}
