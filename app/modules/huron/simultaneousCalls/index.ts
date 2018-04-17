import { SimultaneousCallsComponent } from './simultaneousCalls.component';

export default angular
  .module('huron.simultaneous-calls', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucSimultaneousCalls', new SimultaneousCallsComponent())
  .name;
