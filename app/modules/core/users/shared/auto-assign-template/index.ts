import { AutoAssignTemplateModel } from './auto-assign-template.model';
import { AutoAssignTemplateService } from './auto-assign-template.service';

import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import * as orgServiceModuleName from 'modules/core/scripts/services/org.service';

export {
  AutoAssignTemplateModel,
  AutoAssignTemplateService,
};

export default angular.module('core.users.shared.auto-assign-template', [
  authinfoModuleName,
  urlConfigModuleName,
  orgServiceModuleName,
])
  .service('AutoAssignTemplateModel', AutoAssignTemplateModel)
  .service('AutoAssignTemplateService', AutoAssignTemplateService)
  .name;
