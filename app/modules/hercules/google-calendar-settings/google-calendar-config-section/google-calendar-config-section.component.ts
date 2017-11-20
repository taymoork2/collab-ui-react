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
  public aclAdminAccountForm: ng.IFormController;
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
      this.CloudConnectorService.getService('squared-fusion-gcal'),
    ])
      .then(([ apiKey, service]) => {
        const aclAdminAccount = service.aclAdminAccount || '';
        this.apiKey = apiKey;
        this.aclAdminAccount = aclAdminAccount;
        this.useResources = !!aclAdminAccount;
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.couldNotReadGoogleCalendarStatus');
      });
  }

  public onCheckChange(): void {
    if (!this.useResources) {
      this.aclAdminAccount = '';
    }
  }

  public openUpdateModal(): void {
    this.CloudConnectorService.openSecondSetupModal();
  }

  public updateAclAdminAccount(): void {
    this.CloudConnectorService.updateConfig({
      aclAdminAccount: this.aclAdminAccount,
    })
      .then(() => {
        this.saving = false;
        this.Notification.success('hercules.gcalSetupModal.testAccount.success');
      })
      .catch((err) => {
        this.Notification.errorWithTrackingId(err, 'hercules.gcalSetupModal.testAccount.error');
      })
      .finally(() => {
        this.saving = false;
      });
  }
}

export class GoogleCalendarConfigSectionComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarConfigSectionCtrl;
  public template = require('modules/hercules/google-calendar-settings/google-calendar-config-section/google-calendar-config-section.html');
}
