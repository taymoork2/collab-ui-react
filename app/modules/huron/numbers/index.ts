import { NumberService } from './number.service';

export * from './number.service';
export * from './number';

export default angular
  .module('huron.number-service', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('NumberService', NumberService)
  .name;
