import { IUser, UserPreferencesService, IMeService } from 'modules/core/auth/user/index';
import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';
import { Config } from 'modules/core/config/config';

//////////////////////////

export class TOSService {

  private tosModal: IToolkitModalServiceInstance;
  private user: IUser;
  private hasAcceptedToS: boolean = false;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private Authinfo,
    private MeService: IMeService,
    private UserPreferencesService: UserPreferencesService,
    private $q: ng.IQService,
    private Config: Config,
  ) {
  }

  public hasAcceptedTOS(): ng.IPromise<boolean> {
    if (this.hasAcceptedToS || this.Config.isE2E()) {
      // skip testing if we already know we've accepted it
      return this.$q.resolve(true);
    } else {
      return this.fetchUser()
        .then(() => {
          this.hasAcceptedToS = this.Authinfo.isPartnerAdmin() ||
            (this.user && this.UserPreferencesService.hasPreference(this.user, UserPreferencesService.USER_PREF_TOS));
          return this.hasAcceptedToS;
        })
        .catch(() => {
          // if there is an error, assume they accepted ToS
          return true;
        });
    }
  }

  public openTOSModal(): void {
    if (_.isUndefined(this.tosModal)) {
      this.tosModal = this.$modal.open({
        template: '<terms-of-service></terms-of-service>',
        backdrop: 'static',
        keyboard: false,
        type: 'default',
      });
    }
  }

  public dismissModal(): void {
    if (!_.isUndefined(this.tosModal)) {
      this.tosModal.dismiss();
    }
  }

  public acceptTOS(): ng.IPromise<IUser> {
    return this.UserPreferencesService.setUserPreferences(this.user, UserPreferencesService.USER_PREF_TOS, true)
      .then((newUser) => {
        this.user = newUser;
        if (this.tosModal) {
          this.tosModal.dismiss();
        }
        return newUser;
      });
  }

  /////////////////////////

  private fetchUser(): ng.IPromise<IUser> {
    return this.MeService.getMe()
      .then(user => {
        this.user = user;
        return this.user;
      })
      .catch(() => {
        // Me service failed for some reason.
        // return the cached User (if there is one)
        return this.user;
      });
  }

}
