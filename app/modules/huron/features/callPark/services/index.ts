import { CallParkService } from './callPark.service';
import featureMemberService from 'modules/huron/features';

export * from './callPark.service';
export * from './callPark';

export default angular
  .module('huron.call-park.services', [
    require('angular-resource'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/core/scripts/services/authinfo'),
    featureMemberService,
  ])
  .service('CallParkService', CallParkService)
  .name;
