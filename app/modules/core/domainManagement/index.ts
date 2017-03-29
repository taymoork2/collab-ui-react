import { DomainManagementService } from './domainmanagement.service';

export default angular.module('core.domain-management', [
  'atlas.templates',
  require('modules/core/config/config'),
  require('modules/core/scripts/services/authinfo'),
  require('modules/core/scripts/services/log'),
  require('modules/core/config/urlConfig'),
  require('modules/core/notifications').default,
  'pascalprecht.translate',
])
  .service('DomainManagementService', DomainManagementService)
  .name;
