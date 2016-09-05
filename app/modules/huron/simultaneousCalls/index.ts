import { SimultaneousCallsComponent } from './simultaneousCalls.component';

export default angular
  .module('huron.simultaneous-calls', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate'
  ])
  .component('ucSimultaneousCalls', new SimultaneousCallsComponent())
  .name;