import { Notification } from 'modules/core/notifications';

class GoogleCalendarConfigSectionCtrl implements ng.IComponentController {
  public calendarSectionTexts = {
    title: 'hercules.settings.googleCalendar.title',
  };
  public isGoogleCalendarEntitled = this.Authinfo.isFusionGoogleCal();
  public googleServiceAccount;
  public localizedGoogleServiceAccountHelpText = this.$translate.instant('hercules.settings.googleCalendar.serviceAccountHelpText');

  private serviceId = 'squared-fusion-gcal';

  /* @ngInject */
  constructor(
    private $modal,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private CloudConnectorService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    this.CloudConnectorService.isServiceSetup(this.serviceId)
      .then(isSetup => {
        if (isSetup) {
          this.CloudConnectorService.getServiceAccount(this.serviceId)
            .then(account => {
              this.googleServiceAccount = account;
            })
            .catch(error => {
              this.Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.couldNotReadGoogleCalendarStatus');
            });
        }
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

  public confirmDisable(serviceId) {
    this.$modal.open({
      templateUrl: 'modules/hercules/service-settings/confirm-disable-dialog.html',
      type: 'small',
      controller: 'ConfirmDisableController',
      controllerAs: 'confirmDisableDialog',
      resolve: {
        serviceId: () => serviceId,
      },
    })
    .result
    .then(() => {
      this.$state.go('services-overview');
    });
  }
}

export class GoogleCalendarConfigSectionComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarConfigSectionCtrl;
  public templateUrl = 'modules/hercules/google-calendar-settings/google-calendar-config-section/google-calendar-config-section.html';
}
