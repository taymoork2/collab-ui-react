import { PrivateTrunkService } from './private-trunk.service';

export * from './private-trunk.service';
export * from './private-trunk';

export default angular
  .module('hercules.private-trunk-service', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('PrivateTrunkService', PrivateTrunkService)
  .name;
