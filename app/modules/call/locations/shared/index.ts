import { LocationsService } from './locations.service';
import { CallLocationSettingsData, CallLocationSettingsService } from './location.settings.service';
import { LocationSettingsOptionsService, LocationSettingsOptions } from './location-options.service';
import { UniqueLocationDirective } from 'modules/call/locations/shared/locations-name-unique.directive';
import mediaOnHold from 'modules/huron/media-on-hold';
import locationCosServiceModule from 'modules/call/shared/cos';

export * from './location';
export { LocationsService };
export { CallLocationSettingsService, CallLocationSettingsData };
export { LocationSettingsOptions, LocationSettingsOptionsService };

export default angular
  .module('call.locations.services', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    require('angular-resource'),
    mediaOnHold,
    locationCosServiceModule,
  ])

  .service('LocationsService', LocationsService)
  .service('CallLocationSettingsService', CallLocationSettingsService)
  .service('LocationSettingsOptionsService', LocationSettingsOptionsService)
  .directive('uniqueLocation', UniqueLocationDirective.factory)
  .name;
