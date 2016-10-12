import { CallerIdComponent, CallerIdConfig, CallerIdOption } from './callerId.component';
import { CallerIDService } from './callerId.service';
import { ICallerID } from './callerId';

export const BLOCK_CALLERID_TYPE = {
  name: 'Blocked Outbound Caller ID',
  key: 'EXT_CALLER_ID_BLOCKED_CALLER_ID',
};
export const DIRECT_LINE_TYPE = {
  name: 'Direct Line',
  key: 'EXT_CALLER_ID_DIRECT_LINE',
};
export const COMPANY_CALLERID_TYPE = {
  name: 'Company Caller ID',
  key: 'EXT_CALLER_ID_COMPANY_CALLER_ID',
};
export const COMPANY_NUMBER_TYPE = {
  name: 'Company Number',
  key: 'EXT_CALLER_ID_COMPANY_NUMBER',
};
export const CUSTOM_COMPANY_TYPE = {
  name: 'Custom',
  key: 'EXT_CALLER_ID_CUSTOM',
};
export { CallerIdConfig, CallerIdOption };
export { ICallerID };
export * from './callerId.service';

export default angular
  .module('huron.caller-id', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .component('ucCallerId', new CallerIdComponent())
  .service('CallerIDService', CallerIDService)
  .name;
