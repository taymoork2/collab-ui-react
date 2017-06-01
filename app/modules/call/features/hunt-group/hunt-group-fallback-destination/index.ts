import { HuntGroupFallbackDestinationComponent } from './hunt-group-fallback-destination.component';
import fallbackDestModule from 'modules/call/features/shared/call-feature-fallback-destination';

export default angular
  .module('call.hunt-group.fallback-destination', [
    require('angular-resource'),
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    fallbackDestModule,
  ])
  .component('ucHuntGroupFallbackDestination', new HuntGroupFallbackDestinationComponent())
  .name;
