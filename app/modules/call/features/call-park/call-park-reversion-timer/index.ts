import './call-park-reversion-timer.component.scss';

import { CallParkReversionTimerComponent } from './call-park-reversion-timer.component';

export default angular
  .module('huron.call-park-reversion-timer', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucCallParkReversionTimer', new CallParkReversionTimerComponent())
  .name;
