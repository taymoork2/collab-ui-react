import { CallLocationsComponent } from './locations.component';
import notifications from 'modules/core/notifications';

import { LocationsService } from 'modules/call/locations/locations.service';
import { CopyLocationComponent } from 'modules/call/locations/modals/copy/copyLocation.component';
import { DeleteLocationComponent } from 'modules/call/locations/modals/delete/deleteLocation.component';
import { UniqueLocationDirective } from 'modules/call/locations/uniqueLocation.directive';
import { MakeDefaultLocationComponent } from 'modules/call/locations/modals/makeDefault/makeDefault.component';

//TODO:create individual index files for each modal directory

export default angular
  .module('call.locations', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/cards').default,
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig.js'),
    notifications,
  ])

.component('callLocations', new CallLocationsComponent())
.component('copyLocation', new CopyLocationComponent())
.component('deleteLocation', new DeleteLocationComponent())
.component('makeDefaultLocation', new MakeDefaultLocationComponent())
.directive('uniqueLocation', UniqueLocationDirective.factory)
.service('LocationsService', LocationsService)
.name;
