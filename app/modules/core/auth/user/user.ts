
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
  attributes: string[];
  location: string;
  organizationID: string;
}

export interface IUser {
  schemas: string[];
  userName: string;
  emails: ITypeValue[];
  name: IName;
  entitlements: string[];
  userStatus: string;
  id: string;
  meta: IMeta;
  ims: ITypeValue[];
  displayName: string;
  roles: string[];
  active: boolean;
  accountStatus: string[];
  licenseID: string[];
  userSettings: string[];
  userPreferences: string[];
  sipAddresses: ITypeValue[];
  avatarSyncEnabled: boolean;
  hideLaunch: boolean;
  hideToS: boolean;
}

export class User implements IUser {
  public schemas: string[];
  public userName: string;
  public emails: ITypeValue[];
  public name: IName;
  public entitlements: string[];
  public userStatus: string;
  public id: string;
  public meta: IMeta;
  public ims: ITypeValue[];
  public displayName: string;
  public roles: string[];
  public active: boolean;
  public accountStatus: string[];
  public licenseID: string[];
  public userPreferences: string[];
  public userSettings: string[];
  public sipAddresses: ITypeValue[];
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
