import { CallParkFallbackDestinationComponent } from './callParkFallbackDestination.component';
import callFeatureFallbackDestination from 'modules/call-features/shared/callFeatureFallbackDestination';

export default angular
  .module('huron.call-park-fallback-destination', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    callFeatureFallbackDestination,
  ])
  .component('ucCallParkFallbackDesination', new CallParkFallbackDestinationComponent())
  .name;
