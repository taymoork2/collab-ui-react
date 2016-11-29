import { CallParkFallbackDestinationComponent } from './callParkFallbackDestination.component';
import callFeatureFallbackDestination from 'modules/huron/features/components/callFeatureFallbackDestination';

export default angular
  .module('huron.call-park-fallback-destination', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    callFeatureFallbackDestination,
  ])
  .component('ucCallParkFallbackDesination', new CallParkFallbackDestinationComponent())
  .name;
