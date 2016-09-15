import { DialingComponent } from './dialing.component';
import { DialingService, DialingType, IOption } from './dialing.service';
export * from './dialing.service';

export default angular
  .module('huron.dialing', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
    'ngResource',
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .component('ucDialing', new DialingComponent())
  .service('DialingService', DialingService)
  .name;
