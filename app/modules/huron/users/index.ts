import { HuronUserService } from './user.service';
export * from './user';
export * from './user.service';

export default angular
  .module('huron.user', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('HuronUserService', HuronUserService)
  .name;
