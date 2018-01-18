import { LocationsRoutingPrefixComponent } from './locations-routing-prefix.component';

export { LocationsRoutingPrefixComponent };

export default angular
  .module('call.locations.locations-routing-prefix', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucLocationRoutingPrefix', new LocationsRoutingPrefixComponent())
  .name;
