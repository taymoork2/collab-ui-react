import { RoutingPrefixComponent } from './routingPrefix.component';

export default angular
  .module('huron.settings.routing-prefix', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucRoutingPrefix', new RoutingPrefixComponent())
  .name;
