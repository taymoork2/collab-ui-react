import { IUser, UserPreferencesService, IMeService } from 'modules/core/auth/user/index';
import { IToolkitModalService, IToolkitModalSettings } from 'modules/core/modal';
import { Config } from 'modules/core/config/config';

//////////////////////////

export class TOSService {

  private user: IUser;
  private hasAcceptedToS: boolean = false;

  /* @ngInject */
  constructor(
    private ModalService: IToolkitModalService,
    private $modal,
    private $translate: ng.translate.ITranslateService,
    private Auth,
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
    const options = <IToolkitModalSettings>{
      type: 'dialog',
      title: this.$translate.instant('termsOfService.title'),
      message: this.$translate.instant('termsOfService.message'),
      dismiss: this.$translate.instant('common.decline'),
      close: this.$translate.instant('common.accept'),
    };
    this.ModalService.open(options).result
      .then(() => {
        this.acceptTOS();
      }, () => {
        this.$modal.open({
          template: '<h1 translate="termsOfService.loggingOut"></h1>',
          backdrop: 'static',
          keyboard: false,
          type: 'dialog',
        });
        this.Auth.logout();
      });
  }

  public acceptTOS(): ng.IPromise<IUser> {
    return this.UserPreferencesService.setUserPreferences(this.user, UserPreferencesService.USER_PREF_TOS, true)
      .then((newUser) => {
        this.user = newUser;
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
