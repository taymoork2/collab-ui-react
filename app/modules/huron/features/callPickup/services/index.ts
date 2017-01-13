import { CallPickupGroupService } from './callPickupGroup.service';
import memberService from 'modules/huron/members';

export * from './callPickupGroup';
export * from './callPickupGroup.service';

export default angular
  .module('huron.call-pickup', [
    'atlas.templates',
    'collab.ui',
    require('angular-resource'),
    memberService,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/urlConfig'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('CallPickupGroupService', CallPickupGroupService)
  .name;
