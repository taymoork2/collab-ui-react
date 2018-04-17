class AdvancedMeetingLicenseDescriptionController implements ng.IComponentController {

  private isCloudSharedMeeting: boolean;
  public l10nLicenseDescription: string;
  public l10nLicenseDescriptionTooltip: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): void {
    if (this.isCloudSharedMeeting) {
      this.l10nLicenseDescription = this.$translate.instant('firstTimeWizard.sharedLicense');
      this.l10nLicenseDescriptionTooltip = this.$translate.instant('firstTimeWizard.sharedLicenseTooltip');
    } else {
      this.l10nLicenseDescription = this.$translate.instant('firstTimeWizard.namedLicense');
      this.l10nLicenseDescriptionTooltip = this.$translate.instant('firstTimeWizard.namedLicenseTooltip');
    }
  }
}

export class AdvancedMeetingLicenseDescriptionComponent implements ng.IComponentOptions {
  public controller = AdvancedMeetingLicenseDescriptionController;
  public template = require('./advanced-meeting-license-description.html');
  public bindings = {
    isCloudSharedMeeting: '<',
  };
}
