export class AutoAnswerPhone {
  public uuid: string;
  public name: string;
  public description: string;
  public model: string;
  public enabled: boolean;
  public mode: string | undefined;

  constructor(obj: {
    uuid: string,
    name: string,
    description: string,
    model: string,
    enabled: boolean,
    mode: string | undefined,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.description = obj.description;
    this.model = obj.model;
    this.enabled = obj.enabled;
    this.mode = obj.mode;
  }
}

export class AutoAnswerMember {
  public firstName: string | undefined | null;
  public lastName: string | undefined | null;
  public userName: string | undefined | null;
  public displayName: string | undefined | null;
  public type: string | undefined | null;
  public uuid: string | undefined | null;

  constructor(obj: {
    uuid?: string | null,
    firstName?: string | null,
    lastName?: string | null,
    userName?: string | null,
    displayName?: string | null,
    type?: string | null,
  } = {
    uuid: null,
    firstName: null,
    lastName: null,
    userName: null,
    displayName: null,
    type: null,
  }) {
    this.uuid = obj.uuid;
    this.firstName = obj.firstName;
    this.lastName = obj.lastName;
    this.userName = obj.userName;
    this.displayName = obj.displayName;
    this.type = obj.type;
  }
}

export class AutoAnswer {
  public phones: Array<AutoAnswerPhone> = [];
  public member: AutoAnswerMember;
  public enabledForSharedLineMember: boolean = false;
  public ownerType: string;
}
