import collabUiModuleName from '@collabui/collab-ui-ng';
import * as ngTranslateModuleName from 'angular-translate';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import { IntegrationsManagementListComponent } from './integrations-management-list.component';
import { IntegrationsManagementFakeService } from './integrations-management.fake-service';
import { IntegrationsManagementService } from './integrations-management.service';

export default angular.module('integrations-management', [
  authinfoModuleName,
  collabUiModuleName,
  ngTranslateModuleName,
  urlConfigModuleName,
])
  .component('integrationsManagementList', new IntegrationsManagementListComponent())
  .service('IntegrationsManagementFakeService', IntegrationsManagementFakeService)
  .service('IntegrationsManagementService', IntegrationsManagementService)
  .name;
