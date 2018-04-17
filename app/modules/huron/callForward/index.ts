import { CallForwardComponent } from './callForward.component';
import { CallForwardService } from './callForward.service';
import featureToggleModule from 'modules/core/featureToggle';

export * from './callForward';
export * from './callForward.service';

export default angular
  .module('huron.call-forward', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    'call.shared.call-destination-translate',
    featureToggleModule,
  ])
  .component('ucCallForward', new CallForwardComponent())
  .service('CallForwardService', CallForwardService)
  .name;
