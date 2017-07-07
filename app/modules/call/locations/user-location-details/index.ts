import { UserLocationDetailsComponent } from 'modules/call/locations/user-location-details/userLocationDetails.component';
import { UniqueLocationDirective } from 'modules/call/locations/uniqueLocation.directive';
import { LocationsService } from 'modules/call/locations/locations.service';
import notifications from 'modules/core/notifications';

export default angular
  .module('call.user-location-details', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/cards').default,
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig.js'),
    notifications,
  ])
  .component('userLocationDetails', new UserLocationDetailsComponent())
  .directive('uniqueLocation', UniqueLocationDirective.factory)
  .service('LocationsService', LocationsService)
  .name;
