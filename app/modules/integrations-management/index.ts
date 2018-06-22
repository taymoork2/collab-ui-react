import './integrations-management-list.scss';

import collabUiModuleName from '@collabui/collab-ui-ng';
import * as ngTranslateModuleName from 'angular-translate';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import notificationsModuleName from 'modules/core/notifications';
import { IntegrationsManagementListComponent } from './integrations-management-list.component';
import { IntegrationsManagementFakeService } from './integrations-management.fake-service';
import { IntegrationsManagementService } from './integrations-management.service';
require('angular-ui-grid/ui-grid.js');

export default angular.module('integrations-management', [
  authinfoModuleName,
  collabUiModuleName,
  ngTranslateModuleName,
  notificationsModuleName,
  urlConfigModuleName,
  'ui.grid',
])
  .component('integrationsManagementList', new IntegrationsManagementListComponent())
  .service('IntegrationsManagementFakeService', IntegrationsManagementFakeService)
  .service('IntegrationsManagementService', IntegrationsManagementService)
  .name;
