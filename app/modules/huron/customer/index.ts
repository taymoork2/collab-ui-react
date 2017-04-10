import { HuronCustomerService } from './customer.service';

export * from './customer';
export * from './customer.service';

export default angular
  .module('huron.customer', [
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
  .service('HuronCustomerService', HuronCustomerService)
  .name;
