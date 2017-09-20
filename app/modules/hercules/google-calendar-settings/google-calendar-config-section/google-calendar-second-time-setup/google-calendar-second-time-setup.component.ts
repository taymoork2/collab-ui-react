import { Notification } from 'modules/core/notifications';
import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';

interface IData {
  clientName: string;
  scope: string;
  testAccount: string;
}

export class GoogleCalendarSecondTimeSetupCtrl implements ng.IComponentController {
  private data: IData = {
    clientName: '',
    scope: '',
    testAccount: this.Authinfo.getPrimaryEmail(),
  };
  public loading: boolean = true;
  public processing: boolean = false;
  public testAccountForm: ng.IFormController;
  public errorMessages = {
    testAccount: {
      required: this.$translate.instant('common.invalidRequired'),
      email: this.$translate.instant('common.invalidEmail'),
    },
  };

  /* @ngInject */
  constructor(
    // private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private CloudConnectorService: CloudConnectorService,
    private Notification: Notification,
  ) { }

  public $onInit(): void {
    this.CloudConnectorService.getApiKey()
      .then((data) => {
        this.data.clientName = data.apiClientId;
        this.data.scope = data.scopes[0];
        this.loading = false;
      })
      .catch((err) => {
        this.Notification.errorWithTrackingId(err, 'hercules.gcalSetupModal.error');
      });
  }

  public submit() {
    this.processing = true;
    const config = {
      apiClientId: this.data.clientName,
      testEmailAccount: this.data.testAccount,
    };
    this.CloudConnectorService.updateConfig(config)
      .then(() => {
        this.processing = false;
        this.Notification.success('hercules.gcalSecondSetupModal.success');
        this.dismiss();
      })
      .catch((err) => {
        this.Notification.errorWithTrackingId(err, 'hercules.gcalSetupModal.testAccount.error');
      })
      .finally(() => {
        this.processing = false;
      });
  }

  public dismiss(): void {
    this.CloudConnectorService.dismissSecondSetupModal();
  }
}

export class GoogleCalendarSecondTimeSetupComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarSecondTimeSetupCtrl;
  public template = require('modules/hercules/google-calendar-settings/google-calendar-config-section/google-calendar-second-time-setup/google-calendar-second-time-setup.component.html');
}
