import './cr-icon-info.scss';

import { CrIconInfoComponent } from './cr-icon-info.component';

export default angular.module('core.shared.cr-icon-info', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('crIconInfo', new CrIconInfoComponent())
  .name;
