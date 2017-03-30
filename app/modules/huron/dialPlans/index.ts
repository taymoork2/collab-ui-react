
let DialPlanService = require('./dialPlanService');

let AuthinfoModule = require('modules/core/scripts/services/authinfo');
let HuronConfigModule = require('modules/huron/telephony/telephonyConfig');
let CmiServicesModule = require('modules/huron/telephony/cmiServices');

export default angular
  .module('huron.dialPlans', [
    AuthinfoModule,
    HuronConfigModule,
    CmiServicesModule,
  ])
  .factory('DialPlanService', DialPlanService)
  .name;
