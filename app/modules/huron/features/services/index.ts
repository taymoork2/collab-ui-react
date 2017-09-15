import { FeatureMemberService } from './featureMember.service';
import memberService from 'modules/huron/members';

export * from './featureMember.service';

export default angular
  .module('huron.feature-member-service', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/urlConfig'),
    require('modules/huron/telephony/telephonyConfig'),
    memberService,
  ])
  .service('FeatureMemberService', FeatureMemberService)
  .name;
