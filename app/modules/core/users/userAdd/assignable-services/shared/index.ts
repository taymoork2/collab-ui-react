import configModuleName from 'modules/core/config/config';
import { LicenseUsageUtilService } from './license-usage-util.service';
export { LicenseUsageUtilService } from './license-usage-util.service';
export * from './license-usage-util.interfaces';

export default angular.module('core.users.userAdd.assignable-services.shared', [
  configModuleName,
])
  .service('LicenseUsageUtilService', LicenseUsageUtilService)
  .name;
