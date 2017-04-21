import { CallForwardComponent } from './callForward.component';
import { CallForwardService } from './callForward.service';
import customerServiceModule from 'modules/huron/customer';
import featureToggleModule from 'modules/core/featureToggle';
export * from './callForward';
export * from './callForward.service';

export default angular
  .module('huron.call-forward', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    customerServiceModule,
    'huron.telephoneNumber',
    'huron.telephoneNumberService',
    featureToggleModule,
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .component('ucCallForward', new CallForwardComponent())
  .service('CallForwardService', CallForwardService)
  .name;
