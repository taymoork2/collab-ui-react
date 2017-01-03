import { DialingComponent } from './dialing.component';
import { DialingService } from './dialing.service';
export * from './dialing.service';

export default angular
  .module('huron.dialing', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/featureToggle/featureToggle.service'),
  ])
  .component('ucDialing', new DialingComponent())
  .service('DialingService', DialingService)
  .name;
