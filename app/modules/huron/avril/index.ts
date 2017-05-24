import { AvrilService } from './avril.service';

export * from './avrilSite';
export * from './avril.service';

export default angular
  .module('huron.avril.service', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('AvrilService', AvrilService)
  .name;
