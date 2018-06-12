import './integrations-management.scss';

import { IntegrationsManagementListComponent } from './integrations-management-list.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('integrations-management', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('integrationsManagementList', new IntegrationsManagementListComponent())
  .name;
