import { PstnWizardComponent } from './pstnWizard.component';
import notifications from 'modules/core/notifications';
import { PstnWizardService } from './pstnWizard.service';

export default angular
  .module('huron.pstn-wizard', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    'Huron',
    'huron.telephoneNumberService',
    require('modules/huron/pstn/pstn.service').default,
    require('modules/huron/pstn/pstnService.model').default,
    'huron.pstn-service-address-service',
    notifications,
  ])
  .component('ucPstnPaidWizard', new PstnWizardComponent())
  .service('PstnWizardService', PstnWizardService)
  .name;
