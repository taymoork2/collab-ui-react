import './cr-checkbox-item.scss';

import { CrCheckboxItemComponent } from './cr-checkbox-item.component';
import sharedModuleName from 'modules/core/users/userAdd/assignable-services/shared';
import coreSharedModuleName from 'modules/core/shared';

export default angular.module('modules.core.users.shared.cr-checkbox-item', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  sharedModuleName,
  coreSharedModuleName,
])
  .component('crCheckboxItem', new CrCheckboxItemComponent())
  .name;
