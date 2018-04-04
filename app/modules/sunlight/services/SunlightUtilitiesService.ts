export class SunlightUtilitiesService {
  /* @ngInject */
  constructor(
    private StorageKeys,
    private Authinfo,
    private LocalStorage,
    private SunlightConfigService,
    private SunlightConstantsService,
    private ContextAdminAuthorizationService,
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

  public isOrgAdmin() {
    return (this.Authinfo.getOrgId() === this.Authinfo.getUserOrgId());
  }

  public getAAOnboardStatus(aaOnboarded) {
    let aaOnboardStatus = this.SunlightConstantsService.status.SUCCESS;
    if (this.Authinfo.isCareVoice()) {
      aaOnboardStatus = aaOnboarded;
    }
    return aaOnboardStatus;
  }

  public getCareOnboardStatusForAdmin(csOnboarded, appOnboarded, aaOnboarded, jwtOnboarded) {
    const success = this.SunlightConstantsService.status.SUCCESS;
    return (this.isOrgAdmin() && csOnboarded === success
    && appOnboarded === success
    && this.getAAOnboardStatus(aaOnboarded) === success
    && jwtOnboarded === success);
  }

  public getCareOnboardStatusForPartner(csOnboarded, aaOnboarded) {
    const success = this.SunlightConstantsService.status.SUCCESS;
    return (!this.isOrgAdmin() && csOnboarded === success
    && this.getAAOnboardStatus(aaOnboarded) === success);
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
    let isCareOnboarded = false;
    const csOnboarded = _.get(result, 'data.csOnboardingStatus');
    const appOnboarded = _.get(result, 'data.appOnboardStatus');
    const aaOnboarded = _.get(result, 'data.aaOnboardingStatus');
    const jwtOnboarded = _.get(result, 'data.jwtAppOnboardingStatus');
    return this.ContextAdminAuthorizationService.isMigrationNeeded().then(function (migrationNeeded) {
      if (!migrationNeeded && (this.getCareOnboardStatusForAdmin(csOnboarded, appOnboarded, aaOnboarded, jwtOnboarded) ||
        this.getCareOnboardStatusForPartner(csOnboarded, aaOnboarded))) {
        isCareOnboarded = true;
      }
      return isCareOnboarded;
    });
  }

  public isCareSetup() {
    //return value represents if care notification should be shown
    return this.SunlightConfigService.getChatConfig().then(function (result) {
      return this.getCareOnboardingStatus(result);
    }.bind(this), function (error) {
      return !(error.status === 404);
    });
  }
}
