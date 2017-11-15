import { LicenseUsageUtilService } from './license-usage-util.service';
export { LicenseUsageUtilService } from './license-usage-util.service';
export * from './license-usage-util.interfaces';

export default angular.module('core.users.userAdd.assignable-services.shared', [
])
  .service('LicenseUsageUtilService', LicenseUsageUtilService)
  .name;
