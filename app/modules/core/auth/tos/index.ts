import { TermsOfServiceComponent } from './termsOfService.component';
import { TOSService } from './termsOfService.service';
import coreAuthUserModule from 'modules/core/auth/user';
import featureToggleModule from 'modules/core/featureToggle';

import './termsOfService.scss';

export default angular
  .module('core.auth.tos', [
    'atlas.templates',
    'collab.ui',
    coreAuthUserModule,
    featureToggleModule,
  ])
  .service('TOSService', TOSService)
  .component('termsOfService', new TermsOfServiceComponent())
  .name;
