import './locations.component.scss';

import { CallLocationsComponent } from './locations.component';
import { CallLocationComponent } from './location.component';

import notifications from 'modules/core/notifications';
import copyLocationsModule from 'modules/call/locations/locations-copy';
import deleteLocationsModule from 'modules/call/locations/locations-delete';
import makeDefaultLocationsModule from 'modules/call/locations/locations-make-default';
import locationsServiceModule from 'modules/call/locations/shared';
import locationNameModule from 'modules/call/locations/locations-name';
import timeZoneModule from 'modules/call/shared/settings-time-zone';
import preferredLangModule from 'modules/call/settings/settings-preferred-language';
import defaultCountryModule from 'modules/call/settings/settings-default-country';
import outboundDialDigitModule from 'modules/call/settings/settings-outbound-dial-digit';
import locationCosModule from 'modules/call/locations/locations-cos';
import internalRangeServiceModule from 'modules/call/shared/internal-number-range';
import routingPrefixModule from 'modules/call/locations/locations-routing-prefix';
import locationVoicemailModule from 'modules/call/locations/locations-voicemail-avril';

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
    timeZoneModule,
    preferredLangModule,
    defaultCountryModule,
    outboundDialDigitModule,
    locationCosModule,
    internalRangeServiceModule,
    routingPrefixModule,
    locationVoicemailModule,
  ])
.component('ucCallLocations', new CallLocationsComponent())
.component('ucCallLocation', new CallLocationComponent())
.name;
