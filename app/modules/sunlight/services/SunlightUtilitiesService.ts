export class SunlightUtilitiesService {
  /* @ngInject */
  constructor(
    private StorageKeys,
    private Authinfo,
    private LocalStorage,
    private SunlightConfigService,
    private SunlightConstantsService,
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

  public getCareOnboardStatusForAdmin(csOnboarded, appOnboarded, aaOnboarded) {
    const success = this.SunlightConstantsService.successStatus;
    return (this.isOrgAdmin() && csOnboarded === success
    && appOnboarded === success
    && aaOnboarded === success);
  }

  public getCareOnboardStatusForPartner(csOnboarded, aaOnboarded) {
    const success = this.SunlightConstantsService.successStatus;
    return (!this.isOrgAdmin() && csOnboarded === success
    && aaOnboarded === success);
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
    if (this.getCareOnboardStatusForAdmin(csOnboarded, appOnboarded, aaOnboarded) ||
      this.getCareOnboardStatusForPartner(csOnboarded, aaOnboarded)) {
      isCareOnboarded = true;
    }
    return isCareOnboarded;
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
