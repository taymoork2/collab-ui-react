import './cr-checkbox-item.scss';

import { CrCheckboxItemComponent } from './cr-checkbox-item.component';
import sharedModuleName from 'modules/core/users/userAdd/assignable-services/shared';
import coreSharedModuleName from 'modules/core/shared';

export default angular.module('core.shared.cr-checkbox-item', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  sharedModuleName,
  coreSharedModuleName,
])
  .component('crCheckboxItem', new CrCheckboxItemComponent())
  .name;
