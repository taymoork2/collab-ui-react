import configModuleName from 'modules/core/config/config';
import offerNameModuleName from 'modules/core/shared/offer-name';

import { LicenseUsageUtilService } from './license-usage-util.service';
export { LicenseUsageUtilService };
export { AssignableServicesItemCategory, IAssignableLicenseCheckboxState, ILicenseUsage, ILicenseUsageMap, IOnUpdateParam, ISubscription, LicenseStatus } from './license-usage-util.interfaces';

export default angular.module('core.users.userAdd.assignable-services.shared', [
  configModuleName,
  offerNameModuleName,
])
  .service('LicenseUsageUtilService', LicenseUsageUtilService)
  .name;
