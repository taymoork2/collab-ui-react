import { TermsOfServiceComponent } from './termsOfService.component';
import { TOSService } from './termsOfService.service';
import coreAuthUserModule from 'modules/core/auth/user';
import featureToggleModule from 'modules/core/featureToggle';

import './termsOfService.scss';

export default angular
  .module('core.auth.tos', [
    require('@collabui/collab-ui-ng').default,
    coreAuthUserModule,
    featureToggleModule,
  ])
  .service('TOSService', TOSService)
  .component('termsOfService', new TermsOfServiceComponent())
  .name;
