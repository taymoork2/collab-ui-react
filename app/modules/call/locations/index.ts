import './locations.component.scss';

import { CallLocationsComponent } from './locations.component';
import { CallLocationComponent } from './location.component';
import { UniqueLocationDirective } from 'modules/call/locations/locations-unique.directive';

import notifications from 'modules/core/notifications';
import copyLocationsModule from 'modules/call/locations/locations-copy';
import deleteLocationsModule from 'modules/call/locations/locations-delete';
import makeDefaultLocationsModule from 'modules/call/locations/locations-make-default';
import locationsServiceModule from 'modules/call/locations/shared';
import locationNameModule from 'modules/call/locations/locations-name';

export default angular
  .module('call.locations', [
    require('modules/core/cards').default,
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-resource'),
    notifications,
    locationsServiceModule,
    deleteLocationsModule,
    copyLocationsModule,
    makeDefaultLocationsModule,
    locationNameModule,
  ])

.component('ucCallLocations', new CallLocationsComponent())
.component('ucCallLocation', new CallLocationComponent())
.directive('uniqueLocation', UniqueLocationDirective.factory)
.name;
