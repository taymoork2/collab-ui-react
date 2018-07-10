export class SunlightUtilitiesService {

  public isCareSetUpInitialized = true;

  /* @ngInject */
  constructor(
    private StorageKeys,
    private Authinfo,
    private LocalStorage,
    private SunlightConfigService,
    private SunlightConstantsService,
    private ContextAdminAuthorizationService,
    private Log,
    private URService,
  ) {}

  public getCareSetupKey() {
    return (this.StorageKeys.CARE.setUpStatus + '_' + this.Authinfo.getOrgId() + '_' + this.Authinfo.getUserId());
  }

  public cacheCareSetupStatus() {
    this.LocalStorage.put(this.getCareSetupKey(), moment().add(this.SunlightConstantsService.notificationSnoozeHours,
      'hours').toISOString());
  }

  public removeCareSetupKey() {
    if (this.LocalStorage && this.getCareSetupKeyFromStore()) {
      this.LocalStorage.remove(this.getCareSetupKey());
    }
  }

  public getCareSetupKeyFromStore() {
    return this.LocalStorage.get(this.getCareSetupKey());
  }

  public getCareOnboardStatus(csOnboarded, appOnboarded, jwtOnboarded) {
    const success = this.SunlightConstantsService.status.SUCCESS;
    return (csOnboarded === success
    && appOnboarded === success && jwtOnboarded === success);
  }

  public getCareSetupNotificationText() {
    return (this.getCareSetupKeyFromStore() ? 'homePage.setUpCareSecondaryNotification' : 'homePage.setUpCarePrimaryNotification');
  }

  public isSnoozeTimeUp() {
    return (moment().unix() > moment(this.getCareSetupKeyFromStore()).unix());
  }

  public showSetUpCareNotification() {
    const careKeyCached = this.getCareSetupKeyFromStore();
    return ((careKeyCached && this.isSnoozeTimeUp()) || !careKeyCached);
  }

  public getCareOnboardingStatus(result) {
    this.Log.debug('Get Org Chat config is success.');
    const csOnboarded = _.get(result, 'data.csOnboardingStatus');
    const appOnboarded = _.get(result, 'data.appOnboardStatus');
    const jwtOnboarded = _.get(result, 'data.jwtAppOnboardingStatus');
    this.setCareSetupInitStatus(csOnboarded, appOnboarded, jwtOnboarded);
    return this.ContextAdminAuthorizationService.isMigrationNeeded().then((migrationNeeded) => {
      if (!migrationNeeded) {
        return this.URService.getQueue(this.Authinfo.getOrgId()).then(() => {
          return this.getCareOnboardStatus(csOnboarded, appOnboarded, jwtOnboarded);
        }).catch(function (error) {
          return !(error.status === 404);
        });
      }
      return false;
    }, (error) => {
      this.Log.debug('Fetching migration details failed: ', error);
      return true;
    });
  }

  public setCareSetupInitStatus(csOnboarded, appOnboarded, jwtOnboarded) {
    const unknown = this.SunlightConstantsService.status.UNKNOWN;
    if (csOnboarded === unknown && appOnboarded === unknown && jwtOnboarded === unknown) {
      this.isCareSetUpInitialized = false;
    }
  }

  public isCareSetup() {
    //return value represents if care notification should be shown
    return this.SunlightConfigService.getChatConfig().then(function (result) {
      return this.getCareOnboardingStatus(result);
    }.bind(this), function (error) {
      if (error.status === 404) {
        this.isCareSetUpInitialized = false;
      }
      return !(error.status === 404);
    }.bind(this));
  }
}
