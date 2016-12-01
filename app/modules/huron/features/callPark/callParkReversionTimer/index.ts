import { CallParkReversionTimerComponent } from './callParkReversionTimer.component';

export default angular
  .module('huron.call-park-reversion-timer', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucCallParkReversionTimer', new CallParkReversionTimerComponent())
  .name;
