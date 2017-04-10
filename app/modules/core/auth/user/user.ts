
export interface ITypeValue {
  primary: boolean;
  type: string;
  value: string;
}

export interface IName {
  givenName: string;
  familyName: string;
}

export interface IMeta {
  created: string;
  lastModified: string;
  version: string;
  attributes: Array<string>;
  location: string;
  organizationID: string;
}

export interface IUser {
  schemas: Array<string>;
  userName: string;
  emails: Array<ITypeValue>;
  name: IName;
  entitlements: Array<string>;
  userStatus: string;
  id: string;
  meta: IMeta;
  ims: Array<ITypeValue>;
  displayName: string;
  roles: Array<string>;
  active: boolean;
  accountStatus: Array<string>;
  licenseID: Array<string>;
  userSettings: Array<string>;
  userPreferences: Array<string>;
  sipAddresses: Array<ITypeValue>;
  avatarSyncEnabled: boolean;
  hideLaunch: boolean;
  hideToS: boolean;
}

export class User implements IUser {
  public schemas: Array<string>;
  public userName: string;
  public emails: Array<ITypeValue>;
  public name: IName;
  public entitlements: Array<string>;
  public userStatus: string;
  public id: string;
  public meta: IMeta;
  public ims: Array<ITypeValue>;
  public displayName: string;
  public roles: Array<string>;
  public active: boolean;
  public accountStatus: Array<string>;
  public licenseID: Array<string>;
  public userPreferences: Array<string>;
  public userSettings: Array<string>;
  public sipAddresses: Array<ITypeValue>;
  public avatarSyncEnabled: boolean;
  public hideLaunch: boolean;
  public hideToS: boolean;

  constructor() {
    this.schemas = [];
    this.userName = '';
    this.emails = [];
    this.name = {
      givenName: '',
      familyName: '',
    };
    this.entitlements = [];
    this.userStatus = '';
    this.id = '';
    //this.meta: IMeta;
    this.ims = [];
    this.displayName = '';
    this.roles = [];
    this.active = false;
    this.accountStatus = [];
    this.licenseID = [];
    this.userPreferences = [];
    this.userSettings = [];
    this.sipAddresses = [];
    this.avatarSyncEnabled = false;
    this.hideLaunch = false;
    this.hideToS = false;
  }
}
