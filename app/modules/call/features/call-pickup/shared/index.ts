import { CallPickupGroupService } from './call-pickup.service';
import memberService from 'modules/huron/members';
import featureMemberService from 'modules/huron/features/services';

export * from './call-pickup';
export { CallPickupGroupService };

export default angular
  .module('call.call-pickup.services', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/urlConfig'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/huron/telephony/telephonyConfig'),
    memberService,
    featureMemberService,
  ])
  .service('CallPickupGroupService', CallPickupGroupService)
  .name;
