import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';

import './office-365-fail-modal.scss';

class Office365FailModalController implements ng.IComponentController {
  public close: Function;
  public dismiss: Function;
  public reason: number;
  public reasonKey: string = this.CloudConnectorService.getProvisioningResultTranslationKey(this.reason);

  /* @ngInject */
  constructor(
    private CloudConnectorService: CloudConnectorService,
  ) {}
}

export class Office365FailModalComponent implements ng.IComponentOptions {
  public controller = Office365FailModalController;
  public template = require('modules/services-overview/new-hybrid/office-365-fail-modal/office-365-fail-modal.html');
  public bindings = {
    reason: '<',
    close: '&',
    dismiss: '&',
  };
}
