import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import sharedModuleName from 'modules/core/users/userAdd/shared';
import { CrServicesPanelsComponent } from './cr-services-panels.component';
import featuresModule from 'modules/core/featureToggle';

export default angular.module('core.users.userAdd.cr-services-panels', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  authinfoModuleName,
  sharedModuleName,
  featuresModule,
])
  .component('crServicesPanels', new CrServicesPanelsComponent())
  .name;
