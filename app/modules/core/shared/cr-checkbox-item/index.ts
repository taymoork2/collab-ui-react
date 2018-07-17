import './cr-checkbox-item.scss';

import { CrCheckboxItemComponent } from './cr-checkbox-item.component';

export default angular.module('core.shared.cr-checkbox-item', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  'core.shared',
])
  .component('crCheckboxItem', new CrCheckboxItemComponent())
  .name;
