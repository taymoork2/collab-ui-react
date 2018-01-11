import './snr-wait-timer.component.scss';

import { SnrWaitTimerComponent } from './snr-wait-timer.component';

export default angular
  .module('huron.snr.snr-wait-timer', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucSnrWaitTimer', new SnrWaitTimerComponent())
  .name;
