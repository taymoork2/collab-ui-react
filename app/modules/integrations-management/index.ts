import collabUiModuleName from '@collabui/collab-ui-ng';
import * as ngTranslateModuleName from 'angular-translate';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import modalModuleName from 'modules/core/modal';
import notificationsModuleName from 'modules/core/notifications';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import sectionTitleModuleName from 'modules/core/shared/section-title';
import { IntegrationsManagementListComponent } from './integrations-management-list.component';
import './integrations-management-list.scss';
import { IntegrationsManagementOverviewComponent } from './integrations-management-overview.component';
import './integrations-management-overview.scss';
import { IntegrationsManagementFakeService } from './integrations-management.fake-service';
import { IntegrationsManagementService } from './integrations-management.service';

require('angular-ui-grid/ui-grid.js');

export default angular.module('integrations-management', [
  authinfoModuleName,
  collabUiModuleName,
  modalModuleName,
  ngTranslateModuleName,
  notificationsModuleName,
  sectionTitleModuleName,
  urlConfigModuleName,
  'ui.grid',
])
  .component('integrationsManagementList', new IntegrationsManagementListComponent())
  .component('integrationsManagementOverview', new IntegrationsManagementOverviewComponent())
  .service('IntegrationsManagementFakeService', IntegrationsManagementFakeService)
  .service('IntegrationsManagementService', IntegrationsManagementService)
  .name;
