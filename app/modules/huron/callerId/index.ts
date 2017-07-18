import { CallerIdComponent, CallerIdConfig, CallerIdOption } from './callerId.component';
import { CallerIDService } from './callerId.service';
import { CallerID, ICallerID } from './callerId';
import lineService from 'modules/huron/lines/services';

export { CallerIdConfig, CallerIdOption };
export { CallerID, ICallerID };
export * from './callerId.service';

export default angular
  .module('huron.caller-id', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/huron/telephony/cmiServices'),
    lineService,
  ])
  .component('ucCallerId', new CallerIdComponent())
  .service('CallerIDService', CallerIDService)
  .name;
