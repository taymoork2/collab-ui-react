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
import locationVoicemailModule from 'modules/call/locations/locations-voicemail';
import locationCallerIdModule from 'modules/call/locations/locations-caller-id';
import externalCallTransferModule from 'modules/call/settings/settings-external-call-transfer';
import callEmergencyServicesModule from 'modules/call/shared/call-emergency-services';
import DialPlanServiceModule from 'modules/huron/dialPlans';

export * from './shared';
export * from './locations-user-details';

export default angular
  .module('call.locations', [
    require('modules/core/cards').default,
    require('@collabui/collab-ui-ng').default,
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
    locationCallerIdModule,
    externalCallTransferModule,
    callEmergencyServicesModule,
    DialPlanServiceModule,
  ])
.component('ucCallLocations', new CallLocationsComponent())
.component('ucCallLocation', new CallLocationComponent())
.name;
