export * from './onboard.interfaces';

import { AutoAssignTemplateService } from './auto-assign-template.service';

export default angular.module('core.users.shared', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .service('AutoAssignTemplateService', AutoAssignTemplateService)
  .name;
