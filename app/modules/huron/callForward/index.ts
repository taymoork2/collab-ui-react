import { CallForwardComponent } from './callForward.component';
import { CallForwardService } from './callForward.service';
import customerServiceModule from 'modules/huron/customer';
export * from './callForward';
export * from './callForward.service';

export default angular
  .module('huron.call-forward', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    customerServiceModule,
    'huron.telephoneNumber',
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .component('ucCallForward', new CallForwardComponent())
  .service('CallForwardService', CallForwardService)
  .name;
