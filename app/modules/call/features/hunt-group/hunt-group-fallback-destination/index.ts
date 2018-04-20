import './hunt-group-fallback-destination.component.scss';
import { HuntGroupFallbackDestinationComponent } from './hunt-group-fallback-destination.component';
import fallbackDestModule from 'modules/call/features/shared/call-feature-fallback-destination';

export default angular
  .module('call.hunt-group.fallback-destination', [
    require('angular-resource'),
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    fallbackDestModule,
  ])
  .component('ucHuntGroupFallbackDestination', new HuntGroupFallbackDestinationComponent())
  .name;
