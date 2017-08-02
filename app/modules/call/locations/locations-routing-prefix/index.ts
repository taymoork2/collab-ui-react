import { LocationsRoutingPrefixComponent } from './locations-routing-prefix.component';

export { LocationsRoutingPrefixComponent };

export default angular
  .module('call.locations.locations-routing-prefix', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
  ])
  .component('ucLocationRoutingPrefix', new LocationsRoutingPrefixComponent())
  .name;
