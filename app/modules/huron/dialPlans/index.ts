import { DialPlanService } from './dialPlan.service';

export * from './dialPlan';
export * from './dialPlan.service';

export default angular
  .module('huron.dialPlans', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
    require('modules/huron/telephony/cmiServices'),
  ])
  .service('DialPlanService', DialPlanService)
  .name;
