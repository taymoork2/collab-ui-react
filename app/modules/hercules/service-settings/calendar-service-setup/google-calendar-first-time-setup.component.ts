import { Notification } from 'modules/core/notifications';
import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';

type StepName = 'loading' | 'authorization' | 'test-account' | 'completion';

interface IStep {
  name: StepName;
  next: () => any;
  back: () => any;
  canGoNext: () => boolean;
}

interface IData {
  adminAccount: string;
  clientName: string;
  scope: string;
  testAccount: string;
  useResources: boolean;
}

export class GoogleCalendarFirstTimeSetupCtrl implements ng.IComponentController {
  private steps: IStep[] = [{
    name: 'loading',
    next: () => { this.currentStep = 'authorization'; },
    canGoNext: () => !this.loading,
    back: () => {},
  }, {
    name: 'authorization',
    next: () => { this.currentStep = 'test-account'; },
    canGoNext: () => true,
    back: () => {},
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
          this.Notification.errorWithTrackingId(err, 'hercules.gcalSetupModal.testAccount.error');
        })
        .finally(() => {
          this.processing = false;
        });
    },
    canGoNext: () => {
      return this.testAccountForm.$valid;
    },
    back: () => { this.currentStep = 'authorization'; },
  }, {
    name: 'completion',
    next: () => null,
    canGoNext: () => false,
    back: () => {},
  }];
  private data: IData = {
    clientName: '',
    scope: '',
    testAccount: '',
    adminAccount: '',
    useResources: false,
  };
  public currentStep: StepName = 'loading';
  public loading: boolean = true;
  public processing: boolean = false;
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
        this.Notification.errorWithTrackingId(err, 'hercules.gcalSetupModal.error');
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

  public onCheckChange(): void {
    if (!this.data.useResources) {
      this.data.adminAccount = '';
    }
  }

  public done(): void {
    this.CloudConnectorService.dismissSetupModal();
    this.$state.go('google-calendar-service.settings');
  }

  public back(): void {
    const currentStep = _.find(this.steps, step => step.name === this.currentStep);
    if (currentStep.name === 'test-account') {
      currentStep.back();
      return;
    }
    this.CloudConnectorService.dismissSetupModal('back');
  }

  public dismiss(): void {
    this.CloudConnectorService.dismissSetupModal();
  }

  public goToUsers(): void {
    this.dismiss();
    this.$state.go('users.list');
  }

  public manageUsers(): void {
    this.dismiss();
    this.$state.go('users.list')
      .then(() => {
        this.$state.go('users.manage.org');
      });
  }
}

export class GoogleCalendarFirstTimeSetupComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarFirstTimeSetupCtrl;
  public template = require('modules/hercules/service-settings/calendar-service-setup/google-calendar-first-time-setup.component.html');
  public bindings = {
    firstTimeSetup: '=',
  };
}
