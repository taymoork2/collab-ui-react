
/* A User */
export interface IUser {
  id: string;
  userName: string;
  entitlements: Array<string>;
  licenseID: Array<string>;
  addresses: Array<any>;
  meta: Object;
  accountStatus: Array<string>;
  success: boolean;
  pendingStatus: boolean;
  userSettings: Array<string>;
  trainSiteNames: Array<string>;
  roles: Array<string>;
  invitations?: IServiceInvitations;
  hasEntitlement?(entitlement: string): boolean;
}

/* Instance of a User */
export class User implements IUser {
  public id: string;
  public userName: string;
  public entitlements: Array<string>;
  public licenseID: Array<string>;
  public addresses: Array<any>;
  public meta: Object;
  public accountStatus: Array<string>;
  public success: boolean;
  public pendingStatus: boolean;
  public userSettings: Array<string>;
  public trainSiteNames: Array<string>;
  public roles: Array<string>;
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
    roles: [],
  }) {
    _.extend(this, obj);
  }

  public hasEntitlement(entitlement: string): boolean {
    return _.some(this.entitlements, (ent) => {
      return _.isEqual(ent, entitlement);
    });
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
  effectiveLicenses: Array<IEffectiveLicense>;
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
    private Auth,
    private WebExUtilsFact,
    private Config,
    private SunlightConfigService,
    private ServiceSetup,
    private $translate,
  ) {
    this.invitationResource = this.$resource(this.UrlConfig.getAdminServiceUrl() + 'organization/:customerId/invitations/:userId', {
      customerId: '@customerId',
      userId: '@userId',
    });
  }

  /* Gets the User with the given UserId, and sets internal data for that user */
  public getUser(userId: string): ng.IPromise<IUserData> {

    let userData: IUserData = new UserData();

    const userUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/' + userId;
    return this.$http.get(userUrl)
      .then((response) => {
        userData.user = new User(<IUser>response.data);
        userData.sqEntitlements = new SquaredEntitlements(this.Utils.getSqEntitlements(userData.user));
      })
      .then(() => {
        return this.updateTrainSiteNames(userData);
      })
      .then(() => {
        return this.getAccountStatus(userData);
      })
      .then(() => {
        return this.updateInvitationStatus(userData);
      });
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
  private updateInvitationStatus(userData: IUserData): ng.IPromise<IUserData> | IUserData {

    let promise = this.$q.resolve();

    if (_.isEmpty(userData.user.entitlements)) {

      let hasSyncKms = _.includes(userData.user.roles, this.Config.backend_roles.ciscouc_ces);
      let hasCiscoucCES = _.includes(userData.user.roles, this.Config.backend_roles.ciscouc_ces);

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

            let confId = this.getInvitationDetails(inviteResponse.effectiveLicenses, 'CF');
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
  private getInvitationDetails(invitations: Array<IEffectiveLicense>, license: string): any {
    if (invitations) {
      let idx = _.findIndex(invitations, function (invite: any) {
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

  private updateTrainSiteNames(userData: IUserData): IUserData {
    if (userData.user.trainSiteNames) {
      let ciTrainSiteNames = userData.user.trainSiteNames.filter(
        (chkSiteUrl) => {
          return this.WebExUtilsFact.isCIEnabledSite(chkSiteUrl);
        },
      );
      userData.user.trainSiteNames = (0 < ciTrainSiteNames.length) ? ciTrainSiteNames : [];
    }
    return userData;
  }

  private getAccountStatus(userData: IUserData): ng.IPromise<IUserData> | IUserData {
    // user status pending until we determine otherwise
    userData.user.pendingStatus = false;
    return this.Auth.isOnlineOrg()
      .then((isOnline: boolean) => {

        // is there a sign-up date for the user?
        let userHasSignedUp = _.some(userData.user.userSettings, (userSetting) => {
          return userSetting.indexOf('spark.signUpDate') > 0;
        });

        // is an active user if user has entitlements AND (has signed up, or is in an onlineOrg, or is in Cisco org)
        let isActiveUser = !_.isEmpty(userData.user.entitlements) &&
          (userHasSignedUp || !!isOnline ||
            (userData.user && _.isFunction(userData.user.hasEntitlement) && userData.user.hasEntitlement('ciscouc')));

        userData.user.pendingStatus = !isActiveUser;
        return userData;
      });
  }

  public getUserPreferredLanguage(languageCode) {
    return this.ServiceSetup.getAllLanguages().then(languages => {
      if (_.isEmpty(languages)) { return this.DEFAULT_LANG; }
      let translatedLanguages =  this.ServiceSetup.getTranslatedSiteLanguages(languages);
      return this.findPreferredLanguageByCode(translatedLanguages, languageCode);
    });
  }

  private findPreferredLanguageByCode(languages, language_code): any {
    return _.find(languages, {
      value: language_code,
    });
  }

  private get DEFAULT_LANG() {
    return {
      label: this.$translate.instant('languages.englishAmerican'),
      value: 'en_US',
    };
  }
}
