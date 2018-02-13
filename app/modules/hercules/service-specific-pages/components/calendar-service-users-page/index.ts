import './calendar-service-users-page.scss';

import { CalendarServiceUsersPageComponent } from './calendar-service-users-page.component';
import * as ngTranslateModuleName from 'angular-translate';
import * as analyticsModuleName from 'modules/core/analytics';
import collabUiModuleName from '@collabui/collab-ui-ng';
import ussServiceModuleName from 'modules/hercules/services/uss.service';

export default angular.module('hercules.service-specific-pages.components.calendar-service-users-page', [
  ngTranslateModuleName,
  collabUiModuleName,
  analyticsModuleName,
  ussServiceModuleName,
])
  .component('calendarServiceUsersPage', new CalendarServiceUsersPageComponent())
  .name;
