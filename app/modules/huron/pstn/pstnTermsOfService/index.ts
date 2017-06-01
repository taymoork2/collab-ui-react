import { PstnTermsOfServiceComponent } from './pstnTermsOfService.component';
import pstnProvidersService from '../pstnProviders';
import pstnModel from '../pstn.model';
import pstnService from '../pstn.service';

export { PSTN_TOS_ACCEPT } from './pstnTermsOfService.const';

export default angular
  .module('huron.pstn.pstn-terms-of-service', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    pstnModel,
    pstnService,
    pstnProvidersService,
  ])
  .component('ucPstnTermsOfService', new PstnTermsOfServiceComponent())
  .name;
