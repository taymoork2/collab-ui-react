import { CustomerConfigService } from './customerConfig.service';

export default angular
  .module('call.shared.customer-config-ces', [])
  .service('CustomerConfigService', CustomerConfigService)
  .name;
