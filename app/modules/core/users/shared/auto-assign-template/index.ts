import { AutoAssignTemplateModel } from './auto-assign-template.model';
import { AutoAssignTemplateService } from './auto-assign-template.service';

import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import messengerInteropModuleName from 'modules/core/users/userAdd/shared/messenger-interop';
import * as orgServiceModuleName from 'modules/core/scripts/services/org.service';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';

export {
  AutoAssignTemplateModel,
  AutoAssignTemplateService,
};

export default angular.module('core.users.shared.auto-assign-template', [
  authinfoModuleName,
  messengerInteropModuleName,
  orgServiceModuleName,
  urlConfigModuleName,
])
  .service('AutoAssignTemplateModel', AutoAssignTemplateModel)
  .service('AutoAssignTemplateService', AutoAssignTemplateService)
  .name;
