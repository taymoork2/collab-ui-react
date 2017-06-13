export interface ILocation {
  uuid: string;
  name: string;
  routingPrefix: string;
  userCount: number;
  placeCount: number;
  isDefault: boolean;
}

export class Location implements ILocation {
  public uuid: string;
  public name: string;
  public routingPrefix: string;
  public userCount: number;
  public placeCount: number;
  public isDefault: boolean;

  public constructor (
    uuid: string,
    name: string,
    routingPrefix: string,
    userCount: number,
    placeCount: number,
    isDefault: boolean,
  ) {
    this.uuid = uuid;
    this.routingPrefix = routingPrefix;
    this.name = name;
    this.placeCount = placeCount;
    this.userCount = userCount;
    this.isDefault = isDefault;
  }
}
