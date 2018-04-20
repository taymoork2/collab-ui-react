import { CallerIdComponent, CallerIdConfig, CallerIdOption } from './callerId.component';
import { CallerIDService } from './callerId.service';
import { CallerID, ICallerID } from './callerId';
import lineService from 'modules/huron/lines/services';
import FeatureToggleModule from 'modules/core/featureToggle';
import SharedLocationsModule from 'modules/call/locations/shared';

export { CallerIdConfig, CallerIdOption };
export { CallerID, ICallerID };
export * from './callerId.service';

export default angular
  .module('huron.caller-id', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/huron/telephony/cmiServices'),
    'call.shared.call-destination-translate',
    lineService,
    FeatureToggleModule,
    SharedLocationsModule,
  ])
  .component('ucCallerId', new CallerIdComponent())
  .service('CallerIDService', CallerIDService)
  .name;
