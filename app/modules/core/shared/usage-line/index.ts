import './usage-line.scss';

import { UsageLineComponent } from './usage-line.component';

export default angular.module('core.shared.usage-line', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('usageLine', new UsageLineComponent())
  .name;
