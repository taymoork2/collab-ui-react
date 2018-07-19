import './cr-checkbox-item.scss';

import { CrCheckboxItemComponent } from './cr-checkbox-item.component';
import stringUtilModuleName from 'modules/core/shared/string-util';

export default angular.module('core.shared.cr-checkbox-item', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  stringUtilModuleName,
])
  .component('crCheckboxItem', new CrCheckboxItemComponent())
  .name;
