import { Notification } from 'modules/core/notifications';
import { CloudConnectorService, IApiKey } from 'modules/hercules/services/calendar-cloud-connector.service';
// import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

class GoogleCalendarConfigSectionCtrl implements ng.IComponentController {
  public useResources: boolean;
  public calendarSectionTexts = {
    title: 'hercules.settings.googleCalendar.title',
  };
  public apiKey: IApiKey;
  public aclAdminAccount: string;
  public errorMessages = {
    aclAdminAccount: {
      required: this.$translate.instant('common.invalidRequired'),
      email: this.$translate.instant('common.invalidEmail'),
    },
  };
  public testAccountForm: ng.IFormController;
  public saving = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private CloudConnectorService: CloudConnectorService,
    private Notification: Notification,
  ) { }

  public $onInit() {
    this.$q.all([
      this.CloudConnectorService.getApiKey(),
      this.CloudConnectorService.getService(),
    ])
      .then(([ apiKey, { aclAdminAccount = '' } ]) => {
        this.apiKey = apiKey;
        this.aclAdminAccount = aclAdminAccount;
        this.useResources = !!aclAdminAccount;
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.couldNotReadGoogleCalendarStatus');
      });
  }

  public updateConfig() {
    this.saving = true;
    // this.CloudConnectorService.updateConfig({
    //   apiClientId: this.apiKey.apiClientId,
    //   aclAdminAccount: this.data.adminAccount,
    //   testEmailAccount: this.data.testAccount,
    // })
    //   .then(() => {
    //     this.saving = false;
    //   })
    //   .catch((err) => {
    //     this.Notification.errorWithTrackingId(err, 'hercules.settings.googleCalendar.setupModal.testAccount.error');
    //   })
    //   .finally(() => {
    //     this.saving = false;
    //   });
  }
}

export class GoogleCalendarConfigSectionComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarConfigSectionCtrl;
  public templateUrl = 'modules/hercules/google-calendar-settings/google-calendar-config-section/google-calendar-config-section.html';
}
