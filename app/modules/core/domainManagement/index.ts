import { DomainManagementService } from './domainmanagement.service';
import { DomainManagementCtrl } from './domainManagementCtrl';
import { DomainManageAddCtrl } from './domainManageAddCtrl';
import { DomainManageClaimCtrl } from './domainManageClaimCtrl';
import { DomainManageDeleteCtrl } from './domainManageDeleteCtrl';
import { DomainManageInstructionsCtrl } from './domainManageInstructionsCtrl';
import { DomainManageVerifyCtrl } from './domainManageVerifyCtrl';

require('./_domainManagement.scss');

export { DomainManagementCtrl };

export default angular.module('core.domain-management', [
  require('angular-translate'),
  require('modules/core/config/config').default,
  require('modules/core/scripts/services/authinfo'),
  require('modules/core/scripts/services/log'),
  require('modules/core/scripts/services/logmetricsservice'),
  require('modules/core/config/urlConfig'),
  require('modules/core/notifications').default,
])
  .service('DomainManagementService', DomainManagementService)
  .controller('DomainManagementCtrl', DomainManagementCtrl)
  .controller('DomainManageAddCtrl', DomainManageAddCtrl)
  .controller('DomainManageClaimCtrl', DomainManageClaimCtrl)
  .controller('DomainManageDeleteCtrl', DomainManageDeleteCtrl)
  .controller('DomainManageInstructionsCtrl', DomainManageInstructionsCtrl)
  .controller('DomainManageVerifyCtrl', DomainManageVerifyCtrl)
  .name;
