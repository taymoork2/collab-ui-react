import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { Notification } from 'modules/core/notifications';

import './office-365-test-modal.scss';

class Office365TestModalController implements ng.IComponentController {
  public close: Function;
  public dismiss: Function;
  public validationMessages = {
    required: this.$translate.instant('common.invalidRequired'),
    email: this.$translate.instant('common.invalidEmail'),
  };
  public emailTestingForm: ng.IFormController;
  public email: string;
  public loading = false;
  public success = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private CloudConnectorService: CloudConnectorService,
    private Notification: Notification,
  ) {}

  public test(email: string): void {
    this.loading = true;
    this.CloudConnectorService.confirmO365Provisioning(email)
      .then(() => {
        this.success = true;
      })
      .catch((error) => {
        this.loading = false;
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

  public handleKeypress(event: KeyboardEvent): void {
    if (event.keyCode === 13 && this.emailTestingForm.$valid) {
      this.test(this.email);
    }
  }
}

export class Office365TestModalComponent implements ng.IComponentOptions {
  public controller = Office365TestModalController;
  public templateUrl = 'modules/services-overview/new-hybrid/office-365-test-modal/office-365-test-modal.html';
  public bindings = {
    close: '&',
    dismiss: '&',
  };
}
