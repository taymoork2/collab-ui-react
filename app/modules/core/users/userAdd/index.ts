import './_user-add.scss';

import OnboardService from './onboard.service';

import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import configModuleName from 'modules/core/config/config';
import crServicesPanelsModuleName from './cr-services-panels';
import sharedModuleName from './shared';
import assignableServicesModuleName from './assignable-services';

// TODO (mipark2):
// - register other components in this directory to this module
export default angular
  .module('core.users.userAdd', [
    authInfoModuleName,
    configModuleName,
    crServicesPanelsModuleName,
    sharedModuleName,
    assignableServicesModuleName,
  ])
  .service('OnboardService', OnboardService)
  .name;