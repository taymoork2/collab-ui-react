import './imp-service-users-page.scss';

import { ImpServiceUsersPageComponent } from './imp-service-users-page.component';
import * as ngTranslateModuleName from 'angular-translate';
import * as analyticsModuleName from 'modules/core/analytics';
import collabUiModuleName from '@collabui/collab-ui-ng';
import ussServiceModuleName from 'modules/hercules/services/uss.service';

export default angular.module('hercules.service-specific-pages.components.imp-service-users-page', [
  ngTranslateModuleName,
  collabUiModuleName,
  analyticsModuleName,
  ussServiceModuleName,
])
  .component('impServiceUsersPage', new ImpServiceUsersPageComponent())
  .name;
