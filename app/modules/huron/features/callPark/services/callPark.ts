export class CallPark {
  public uuid: string | undefined;
  public name: string | undefined;
  public startRange: string | undefined;
  public endRange: string | undefined;
  public fallbackDestination: FallbackDestination;
  public members: Array<CallParkMember>;

  constructor(obj: {
    uuid?: string,
    name?: string,
    startRange?: string,
    endRange?: string,
    fallbackDestination: FallbackDestination,
    members: Array<CallParkMember>,
  } = {
    uuid: undefined,
    name: undefined,
    startRange: undefined,
    endRange: undefined,
    fallbackDestination: new FallbackDestination(),
    members: [],
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.startRange = obj.startRange;
    this.endRange = obj.endRange;
    this.fallbackDestination = obj.fallbackDestination;
    this.members = obj.members;
  }
}

export class FallbackDestination {
  public number?: string | null;
  public numberUuid?: string | null;
  public name?: string | null;
  public memberUuid?: string | null;
  public sendToVoiceMail: boolean;
}

export class CallParkMember {
  public memberUuid: string;
  public memberName: string;

  constructor(obj: {
    memberUuid: string,
    memberName: string,
  }) {
    this.memberUuid = obj.memberUuid;
    this.memberName = obj.memberName;
  }
}
