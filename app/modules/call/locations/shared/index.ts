import { LocationsService } from './locations.service';
import { CallLocationSettingsData, CallLocationSettingsService } from './location.settings.service';
import { LocationSettingsOptionsService, LocationSettingsOptions } from './location-options.service';
import { ILocation, Location, ILocationListItem } from './location';
import { UniqueLocationDirective } from 'modules/call/locations/shared/locations-name-unique.directive';
import locationCosServiceModule from 'modules/call/shared/cos';

export { ILocation, Location, ILocationListItem };
export { LocationsService };
export { CallLocationSettingsService, CallLocationSettingsData };
export { LocationSettingsOptions, LocationSettingsOptionsService };

export default angular
  .module('call.locations.services', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    require('angular-resource'),
    locationCosServiceModule,
  ])

  .service('LocationsService', LocationsService)
  .service('CallLocationSettingsService', CallLocationSettingsService)
  .service('LocationSettingsOptionsService', LocationSettingsOptionsService)
  .directive('uniqueLocation', UniqueLocationDirective.factory)
  .name;
