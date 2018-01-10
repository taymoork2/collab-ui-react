import './assignable-advanced-meetings.scss';

import { AssignableAdvancedMeetingsComponent } from './assignable-advanced-meetings.component';
import sharedModuleName from 'modules/core/users/userAdd/assignable-services/shared';
import advancedMeetingLicenseDescriptionModuleName from './advanced-meeting-license-description';
import advancedMeetingSiteUrlModuleName from './advanced-meeting-site-url';

export default angular.module('core.users.userAdd.assignable-services.assignable-services-row.assignable-advanced-meetings', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  sharedModuleName,
  advancedMeetingLicenseDescriptionModuleName,
  advancedMeetingSiteUrlModuleName,
])
  .component('assignableAdvancedMeetings', new AssignableAdvancedMeetingsComponent())
  .name;
