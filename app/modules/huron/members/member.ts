import { Line } from 'modules/huron/lines/services/line';

export class Member {
  public uuid: string;
  public type: string;
  public firstName?: string | undefined;
  public lastName?: string | undefined;
  public userName?: string | undefined;
  public displayName?: string | undefined;
  public numbers: Array<Line>;

  constructor(obj: {
    uuid: string,
    type: string,
    firstName?: string | undefined,
    lastName?: string | undefined,
    userName?: string | undefined,
    displayName?: string | undefined,
    numbers: Array<Line>
  }) {
    this.uuid = obj.uuid;
    this.type = obj.type;
    this.firstName = obj.firstName;
    this.lastName = obj.lastName;
    this.userName = obj.userName;
    this.displayName = obj.displayName;
    this.numbers = obj.numbers;
  }
}
