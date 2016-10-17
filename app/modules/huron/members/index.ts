import { MemberService } from './member.service';

export * from './member.service';
export * from './member';
export const USER_PLACE = 'USER_PLACE';
export const USER_REAL_USER = 'USER_REAL_USER';

export default angular
  .module('huron.member-service', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('MemberService', MemberService)
  .name;
