import { CallParkService } from './call-park.service';
import featureMemberService from 'modules/huron/features/services';

export * from './call-park.service';
export * from './call-park';

export default angular
  .module('huron.call-park.services', [
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    featureMemberService,
  ])
  .service('CallParkService', CallParkService)
  .name;
