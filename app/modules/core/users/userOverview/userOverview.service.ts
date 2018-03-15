import { Config } from 'modules/core/config/config';

/* A User */
export interface IUser {
  id: string;
  userName: string;
  entitlements: string[];
  licenseID: string[];
  addresses: any[];
  meta: Object;
  accountStatus: string[];
  success: boolean;
  pendingStatus: boolean;
  userSettings: string[];
  trainSiteNames: string[];
  linkedTrainSiteNames: string[];
  userPreferences: string[];
  roles: string[];
  invitations?: IServiceInvitations;
}

/* Instance of a User */
export class User implements IUser {
  public id: string;
  public userName: string;
  public entitlements: string[];
  public licenseID: string[];
  public addresses: any[];
  public meta: Object;
  public accountStatus: string[];
  public success: boolean;
  public pendingStatus: boolean;
  public userSettings: string[];
  public trainSiteNames: string[];
  public linkedTrainSiteNames: string[];
  public userPreferences: string[];
  public roles: string[];
  public invitations?: IServiceInvitations;

  constructor(obj: IUser = {
    id: '',
    userName: '',
    entitlements: [],
    licenseID: [],
    addresses: [],
    meta: {},
    accountStatus: [],
    success: false,
    pendingStatus: false,
    userSettings: [],
    trainSiteNames: [],
    linkedTrainSiteNames: [],
    userPreferences: [],
    roles: [],
  }) {
    _.extend(this, obj);
  }
}

export interface ISquaredEntitlements { }

export class SquaredEntitlements implements ISquaredEntitlements {
  constructor(obj: ISquaredEntitlements = {}) {
    _.extend(this, obj);
  }
}

export interface IUserData {
  user: IUser;
  sqEntitlements: ISquaredEntitlements;
}

class UserData implements IUserData {
  public user: IUser;
  public sqEntitlements: ISquaredEntitlements;

  constructor(obj: IUserData = {
    user: new User(),
    sqEntitlements: new SquaredEntitlements(),
  }) {
    _.extend(this, obj);
  }
}

interface IEffectiveLicense {
  id: string;
  idOperation: string;
}

interface IInvitation {
  effectiveLicenses: IEffectiveLicense[];
}

interface IServiceInvitations {
  ms: boolean;
  cf: string;
  cc: boolean;
}

class ServiceInvitations implements IServiceInvitations {
  public ms: boolean;
  public cf: string;
  public cc: boolean;

  constructor(obj: IServiceInvitations = {
    ms: false,
    cf: '',
    cc: false,
  }) {
    _.extend(this, obj);
  }
}

interface IInvitationResource extends ng.resource.IResourceClass<ng.resource.IResource<IInvitation>> {
}

////////////////////////

export class UserOverviewService {

  private invitationResource: IInvitationResource;

  /* @ngInject */
  constructor(
    private UrlConfig,
    private Authinfo,
    private Utils,
    private $http: ng.IHttpService,
    private $resource: ng.resource.IResourceService,
    private $q: ng.IQService,
    private WebExUtilsFact,
    private Config: Config,
    private SunlightConfigService,
    private ServiceSetup,
    private Userservice,
  ) {
    this.invitationResource = this.$resource(this.UrlConfig.getAdminServiceUrl() + 'organization/:customerId/invitations/:userId', {
      customerId: '@customerId',
      userId: '@userId',
    });
  }

  /* Gets the User with the given UserId, and sets internal data for that user */
  public getUser(userId: string): ng.IPromise<IUserData> {

    const userUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + userId;
    return this.$http.get(userUrl)
      .then((response) => {
        const userData: IUserData = new UserData();
        userData.user = new User(<IUser>response.data);
        userData.sqEntitlements = new SquaredEntitlements(this.Utils.getSqEntitlements(userData.user));
        userData.user.trainSiteNames = this.updateTrainSiteNames(userData.user);
        userData.user.pendingStatus = !this.getAccountActiveStatus(userData.user);
        return this.updateInvitationStatus(userData);
      });
  }

  /* Returns true if the user has the entitlement, else returns false */
  public userHasEntitlement(user: IUser, entitlement: string): boolean {
    return _.includes(user.entitlements, entitlement);
  }

  //////////////

  private getInvitationsForUser(userId: string): ng.IPromise<IInvitation> {
    return this.invitationResource.get({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
    }).$promise;
  }

  // If there are no entitlements for the user, then check if there are any pending
  // invitations in Casandra database
  // NOTE: This is temporary until all users are migrated out of Casandra and into CI!
  private updateInvitationStatus(userData: IUserData): ng.IPromise<IUserData> {

    let promise = this.$q.resolve();

    if (_.isEmpty(userData.user.entitlements)) {

      const hasSyncKms = _.includes(userData.user.roles, this.Config.backend_roles.ciscouc_ces);
      const hasCiscoucCES = _.includes(userData.user.roles, this.Config.backend_roles.ciscouc_ces);

      promise = this.getInvitationsForUser(userData.user.id)
        .then((inviteResponse) => {
          if (_.isArray(inviteResponse.effectiveLicenses) && !_.isEmpty(inviteResponse.effectiveLicenses)) {
            // got list of effective licenses, so update our invitations based on that
            if (typeof userData.user.invitations === 'undefined') {
              userData.user.invitations = new ServiceInvitations();
            }

            if (this.getInvitationDetails(inviteResponse.effectiveLicenses, 'MS')) {
              userData.user.invitations.ms = true;
            }

            const confId = this.getInvitationDetails(inviteResponse.effectiveLicenses, 'CF');
            if (confId) {
              userData.user.invitations.cf = confId;
            }

            if (this.getInvitationDetails(inviteResponse.effectiveLicenses, 'CD')) {
              // check if this user exists in Sunlight config, and if so, update the Care invitation
              return this.SunlightConfigService.getUserInfo(userData.user.id)
                .then(() => {
                  if (hasSyncKms && userData.user.invitations) {
                    userData.user.invitations.cc = true;
                  }
                });
            } else if (this.getInvitationDetails(inviteResponse.effectiveLicenses, 'CV')) {
              // check if this user exists in Sunlight config, and if so, update the Care Voice invitation
              return this.SunlightConfigService.getUserInfo(userData.user.id)
                .then(() => {
                  if (hasSyncKms && hasCiscoucCES && userData.user.invitations) {
                    userData.user.invitations.cc = true;
                  }
                });
            }
          }
        })
        .catch(() => {
          // user has no invitations.
          return this.$q.resolve();
        });
    }
    return promise.then(() => userData);

  }

  // return true if the invitations contain the requested license
  private getInvitationDetails(invitations: IEffectiveLicense[], license: string): any {
    if (invitations) {
      const idx = _.findIndex(invitations, function (invite: any) {
        return invite.id.substring(0, 2) === license && invite.idOperation === 'ADD';
      });
      if (idx > -1) {
        if (license === 'CF') {
          return invitations[idx].id;
        } else {
          return true;
        }
      } else {
        if (license === 'CF') {
          return null;
        } else {
          return false;
        }
      }
    }
    return false;
  }

  private updateTrainSiteNames(user: IUser): string[] {
    if (user.trainSiteNames) {
      const ciTrainSiteNames = user.trainSiteNames.filter(
        (chkSiteUrl) => {
          return this.WebExUtilsFact.isCIEnabledSite(chkSiteUrl);
        },
      );
      return (0 < ciTrainSiteNames.length) ? ciTrainSiteNames : [];
    } else {
      return [];
    }
  }

  public userHasActivatedAccountInCommonIdentity(user: IUser): boolean {
    return !_.includes(user.accountStatus, 'pending');
  }

  public getAccountActiveStatus(user: IUser): boolean {
    // is there a sign-up date for the user?
    if (!_.isEmpty(user.entitlements)) {

      const userHasSignedUp = _.some(user.userSettings, (x) => _.includes(x, 'spark.signUpDate'));
      const userHasLastLoginTime = _.has(user.meta, 'lastLoginTime');
      const hasCiscouc = this.userHasEntitlement(user, 'ciscouc');

      return (userHasSignedUp || userHasLastLoginTime || hasCiscouc);
    }
    // user is not active
    return false;
  }

  public getUserPreferredLanguage(languageCode) {
    return this.ServiceSetup.getAllLanguages().then(languages => {
      const userLanguageDetails = {
        language: {},
        translatedLanguages: [],
      };
      if (_.isEmpty(languages)) { return userLanguageDetails; }
      const translatedLanguages = this.ServiceSetup.getTranslatedSiteLanguages(languages);
      if (languageCode) {
        const preferredLanguage = this.findPreferredLanguageByCode(translatedLanguages, languageCode);
        userLanguageDetails.language = preferredLanguage;
      }
      userLanguageDetails.translatedLanguages = translatedLanguages;

      return userLanguageDetails;
    });
  }

  private findPreferredLanguageByCode(languages, language_code): any {
    return _.find(languages, {
      value: language_code,
    });
  }

  public formatLanguage(language_code) {
    const userLangSplit = _.split(language_code, /[-_]+/, 2);
    if (userLangSplit.length <= 1) {
      return language_code;
    }
    return _.toLower(userLangSplit[0]) + '_' + _.toUpper(userLangSplit[1]);
  }

  public updateUserPreferredLanguage(userId: string, languageCode: string) {
    const userData = {
      schemas: this.Config.scimSchemas,
      preferredLanguage: languageCode,
    };
    return this.Userservice.updateUserData(userId, userData);
  }
}
