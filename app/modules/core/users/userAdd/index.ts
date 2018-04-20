import './_user-add.scss';

import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import configModuleName from 'modules/core/config/config';
import crServicesPanelsModuleName from './cr-services-panels';
import sharedModuleName from './shared';
import assignableServicesModuleName from './assignable-services';
import hybridServicesEntitlementsPanelModuleName from './hybrid-services-entitlements-panel';
import manualAddUsersModalModuleName from './manual-add-users-modal';
import addUsersResultsModalModuleName from './add-users-results-modal';

// TODO (mipark2):
// - register other components in this directory to this module
export default angular
  .module('core.users.userAdd', [
    authInfoModuleName,
    configModuleName,
    crServicesPanelsModuleName,
    sharedModuleName,
    assignableServicesModuleName,
    hybridServicesEntitlementsPanelModuleName,
    manualAddUsersModalModuleName,
    addUsersResultsModalModuleName,
  ])
  .name;
