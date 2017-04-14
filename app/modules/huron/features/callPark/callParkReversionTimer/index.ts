import './_cp-reversion-timer.scss';

import { CallParkReversionTimerComponent } from './callParkReversionTimer.component';

export default angular
  .module('huron.call-park-reversion-timer', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucCallParkReversionTimer', new CallParkReversionTimerComponent())
  .name;
