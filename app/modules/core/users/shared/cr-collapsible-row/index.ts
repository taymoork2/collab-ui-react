import './cr-collapsible-row.scss';

import { CrCollapsibleRowComponent } from './cr-collapsible-row.component';

export default angular.module('core.users.shared.cr-collapsible-row', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('crCollapsibleRow', new CrCollapsibleRowComponent())
  .name;
