import './advanced-meeting-license-description.scss';

import { AdvancedMeetingLicenseDescriptionComponent } from './advanced-meeting-license-description.component';
import sharedModuleName from 'modules/core/users/userAdd/assignable-services/shared';

export default angular.module('core.users.userAdd.assignable-services.assignable-services-row.assignable-advanced-meetings.advanced-meeting-license-description', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  sharedModuleName,
])
  .component('advancedMeetingLicenseDescription', new AdvancedMeetingLicenseDescriptionComponent())
  .name;
