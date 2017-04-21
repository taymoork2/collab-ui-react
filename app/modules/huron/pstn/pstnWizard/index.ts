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
    'huron.pstnsetupservice',
    'huron.PstnSetup',
    'huron.pstn-service-address-service',
    notifications,
  ])
  .component('ucPstnPaidWizard', new PstnWizardComponent())
  .service('PstnWizardService', PstnWizardService)
  .name;
