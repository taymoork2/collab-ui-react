import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { Notification } from 'modules/core/notifications';

import './office-365-setup-modal.scss';

class Office365SetupModalController implements ng.IComponentController {
  public redirecting = false;

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
    private CloudConnectorService: CloudConnectorService,
    private Notification: Notification,
  ) {}

  public authorize() {
    this.redirecting = true;
    this.CloudConnectorService.getOffice365AdminConsentUrl()
      .then((url) => {
        this.$window.location.href = url;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        this.redirecting = false;
      });
  }
}

export class Office365SetupModalComponent implements ng.IComponentOptions {
  public controller = Office365SetupModalController;
  public template = require('modules/services-overview/new-hybrid/office-365-setup-modal/office-365-setup-modal.html');
  public bindings = {
    close: '&',
    dismiss: '&',
    firstTime: '<',
  };
}
