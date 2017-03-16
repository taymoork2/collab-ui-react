import { RoutingPrefixComponent } from './routingPrefix.component';

export default angular
  .module('huron.settings.routing-prefix', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucRoutingPrefix', new RoutingPrefixComponent())
  .name;
