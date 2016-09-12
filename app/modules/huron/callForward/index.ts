import { CallForwardComponent } from './callForward.component'

export default angular
  .module('huron.call-forward', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate'
  ])
  .component('ucCallForward', new CallForwardComponent())
  .name;
