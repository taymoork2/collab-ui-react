import { CallerIdComponent, CallerIdConfig, CallerIdOption } from './callerId.component';
import { CallerIDService } from './callerId.service';
import { ICallerID } from './callerId';
import lineService from '../lines/services';
import customerServiceModule from 'modules/huron/customer';
export { CallerIdConfig, CallerIdOption };
export { ICallerID };
export * from './callerId.service';

export default angular
  .module('huron.caller-id', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    'huron.telephoneNumber',
    'huron.telephoneNumberService',
    customerServiceModule,
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/huron/telephony/cmiServices'),
    lineService,
  ])
  .component('ucCallerId', new CallerIdComponent())
  .service('CallerIDService', CallerIDService)
  .name;
