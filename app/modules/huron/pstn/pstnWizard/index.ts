import { PstnWizardComponent } from './pstnWizard.component';
import { PstnWizardService } from './pstnWizard.service';
import pstnModel from '../pstn.model';
import pstnService from '../pstn.service';
import notifications from 'modules/core/notifications';
import huronCountryService from 'modules/huron/countries';

export * from './pstnWizard.service';

export default angular
  .module('huron.pstn.pstn-wizard', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/huron/pstnSetup/pstnServiceAddress/pstnServiceAddress.service'),
    require('modules/core/auth/auth'),
    pstnModel,
    pstnService,
    notifications,
    huronCountryService,
  ])
  .component('ucPstnPaidWizard', new PstnWizardComponent())
  .service('PstnWizardService', PstnWizardService)
  .name;
