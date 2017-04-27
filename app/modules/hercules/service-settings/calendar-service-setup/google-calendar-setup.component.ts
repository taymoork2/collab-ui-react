import { Notification } from 'modules/core/notifications';
import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';

type StepName = 'loading' | 'authorization' | 'test-account' | 'completion';

interface IStep {
  name: StepName;
  next: () => any;
  canGoNext: () => boolean;
}

export class GoogleCalendarSetupCtrl implements ng.IComponentController {
  private steps: IStep[] = [{
    name: 'loading',
    next: () => { this.currentStep = 'authorization'; },
    canGoNext: () => !this.loading,
  }, {
    name: 'authorization',
    next: () => { this.currentStep = 'test-account'; },
    canGoNext: () => true,
  }, {
    name: 'test-account',
    next: () => {
      this.processing = true;
      const config = {
        aclAdminAccount: this.data.adminAccount,
        apiClientId: this.data.clientName,
        testEmailAccount: this.data.testAccount,
      };
      this.CloudConnectorService.updateConfig(config)
        .then(() => {
          this.processing = false;
          this.currentStep = 'completion';
        })
        .catch((err) => {
          this.Notification.errorWithTrackingId(err, 'hercules.settings.googleCalendar.setupModal.testAccount.error');
        })
        .finally(() => {
          this.processing = false;
        });
    },
    canGoNext: () => {
      return this.testAccountForm.$valid;
    },
  }, {
    name: 'completion',
    next: () => null,
    canGoNext: () => false,
  }];
  private data: any = {
    testAccount: this.Authinfo.getPrimaryEmail(),
    adminAccount: '',
    useResources: false,
  };
  public currentStep: StepName = 'loading';
  public loading = true;
  public processing = false;
  public testAccountForm: ng.IFormController;
  public errorMessages = {
    testAccount: {
      required: this.$translate.instant('common.invalidRequired'),
      email: this.$translate.instant('common.invalidEmail'),
    },
    adminAccount: {
      required: this.$translate.instant('common.invalidRequired'),
      email: this.$translate.instant('common.invalidEmail'),
    },
  };

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
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
        this.next();
      })
      .catch((err) => {
        this.Notification.errorWithTrackingId(err, 'hercules.settings.googleCalendar.setupModal.error');
      });
  }

  public next(): void {
    const currentStep = _.find(this.steps, step => step.name === this.currentStep);
    currentStep.next();
  }

  public canGoNext(): boolean {
    const currentStep = _.find(this.steps, step => step.name === this.currentStep);
    return currentStep.canGoNext();
  }

  public done(): void {
    this.CloudConnectorService.dismissSetupModal();
    this.$state.go('google-calendar-service.settings');
  }

  public dismiss(): void {
    this.CloudConnectorService.dismissSetupModal();
  }
}

export class GoogleCalendarSetupComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarSetupCtrl;
  public templateUrl = 'modules/hercules/service-settings/calendar-service-setup/google-calendar-setup.component.html';
}
