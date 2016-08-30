export class CommonUser {
  public uuid: string;
  public userName: string;
  public userDnUuid: string;
  public dnUsage: string;
  public entitlements: string[];
}

export class SharedLineUser extends CommonUser {
  public name: string;
}

export class User extends CommonUser{
  public name: {givenName: string, familyName: string};
}

export class  SharedLineDevice {
  public  userUuid: string;
  public model: string;
  public name: string;
}