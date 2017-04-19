import { SimultaneousCallsComponent } from './simultaneousCalls.component';

export default angular
  .module('huron.simultaneous-calls', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucSimultaneousCalls', new SimultaneousCallsComponent())
  .name;
