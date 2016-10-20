export class SharedLine {
  public uuid: string;
  public primary: boolean = false;
  public user: SharedLineUser;
  public place: SharedLinePlace;
  public phones: Array<SharedLinePhone>;

  constructor(obj: {
    uuid: string,
    primary: boolean,
    user: SharedLineUser,
    place: SharedLinePlace,
    phones: Array<SharedLinePhone>,
  }) {
    this.uuid = obj.uuid;
    this.primary = obj.primary;
    this.user = obj.user;
    this.place = obj.place;
    this.phones = obj.phones;
  }
}

export class SharedLineUser {
  public uuid: string | null | undefined;
  public firstName?: string | null | undefined;
  public lastName?: string | null | undefined;
  public userName?: string | null | undefined;

  constructor(obj: {
    uuid: string | null | undefined,
    firstName?: string | null | undefined,
    lastName?: string | null | undefined,
    userName?: string | null | undefined,
  }) {
    this.uuid = obj.uuid;
    this.firstName = obj.firstName;
    this.lastName = obj.lastName;
    this.userName = obj.userName;
  }
}

export class SharedLinePlace {
  public uuid: string | null | undefined;
  public displayName?: string | null | undefined;

  constructor(obj: {
    uuid: string | null | undefined,
    displayName?: string | null | undefined
  }) {
    this.uuid = obj.uuid;
    this.displayName = obj.displayName;
  }
}

export class SharedLinePhone {
  public uuid: string;
  public description: string;
  public assigned: boolean;

  constructor(obj: {
    uuid: string,
    description: string,
    assigned: boolean,
  }) {
    this.uuid = obj.uuid;
    this.description = obj.description;
    this.assigned = obj.assigned;
  }
}

export class SharedLinePhoneListItem {
  public uuid: string;

  constructor(obj: {
    uuid: string,
  }) {
    this.uuid = obj.uuid;
  }
}
