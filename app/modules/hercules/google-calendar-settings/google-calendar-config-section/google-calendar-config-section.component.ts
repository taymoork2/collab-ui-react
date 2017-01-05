import { Notification } from 'modules/core/notifications';

class GoogleCalendarConfigSectionCtrl implements ng.IComponentController {
  public calendarSectionTexts = {
    title: 'hercules.settings.googleCalendar.title',
  };
  public googleServiceAccount;
  public localizedGoogleServiceAccountHelpText = this.$translate.instant('hercules.settings.googleCalendar.serviceAccountHelpText');

  private serviceId = 'squared-fusion-gcal';

  /* @ngInject */
  constructor(
    private $modal,
    private $translate: ng.translate.ITranslateService,
    private CloudConnectorService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    this.CloudConnectorService.getService(this.serviceId)
      .then(service => {
        if (service.setup) {
          this.googleServiceAccount = service.serviceAccountId;
        }
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.couldNotReadGoogleCalendarStatus');
      });
  }

  public uploadGooglePrivateKey() {
    this.$modal.open({
      templateUrl: 'modules/hercules/service-settings/upload-google-calendar-key.html',
      controller: 'UploadGoogleCalendarKeyController',
      controllerAs: 'uploadKey',
      resolve: {
        googleServiceAccount: () => this.googleServiceAccount,
      },
    })
    .result
    .then(newServiceAccount => {
      this.googleServiceAccount = newServiceAccount;
    });
  }

}

export class GoogleCalendarConfigSectionComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarConfigSectionCtrl;
  public templateUrl = 'modules/hercules/google-calendar-settings/google-calendar-config-section/google-calendar-config-section.html';
}
