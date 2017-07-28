import { LocationsService } from './locations.service';
import { CallLocationSettingsData, CallLocationSettingsService } from './location.settings.service';
import { ILocation, Location, ILocationListItem } from './location';

export { ILocation, Location, ILocationListItem };
export { LocationsService };
export { CallLocationSettingsService, CallLocationSettingsData };

export default angular
  .module('call.locations.services', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    require('angular-resource'),
  ])

  .service('LocationsService', LocationsService)
  .service('CallLocationSettingsService', CallLocationSettingsService)
  .name;
