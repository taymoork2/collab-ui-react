import collabUiModuleName from '@collabui/collab-ui-ng';
import * as ngTranslateModuleName from 'angular-translate';
import { IntegrationsManagementListComponent } from './integrations-management-list.component';
import { IntegrationsManagementFakeService } from './integrations-management.fake-service';
import './integrations-management.scss';

export default angular.module('integrations-management', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('integrationsManagementList', new IntegrationsManagementListComponent())
  .service('IntegrationsManagementFakeService', IntegrationsManagementFakeService)
  .name;
