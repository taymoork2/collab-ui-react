import { CallFeatureFallbackDestinationService } from './fallbackDestination.service';

export * from './fallbackDestination.service';
export * from './fallbackDestination';

export default angular
  .module('huron.fallback-destination-service', [
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),

  ])
  .service('CallFeatureFallbackDestinationService', CallFeatureFallbackDestinationService)
  .name;
