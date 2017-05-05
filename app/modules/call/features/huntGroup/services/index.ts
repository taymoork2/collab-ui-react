import { HuntGroupService } from './huntGroup.service';

export * from './huntGroup';
export * from './huntGroup.service';

export default angular
  .module('huron.hunt-group.services', [
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .service('HuntGroupService', HuntGroupService)
  .name;
