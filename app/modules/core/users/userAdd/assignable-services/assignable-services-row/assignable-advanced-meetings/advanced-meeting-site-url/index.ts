import './advanced-meeting-site-url.scss';

import utilsModuleName from 'modules/webex/utils';

import { AdvancedMeetingSiteUrlComponent } from './advanced-meeting-site-url.component';

export default angular.module('core.users.userAdd.assignable-services.assignable-services-row.assignable-advanced-meetings.advanced-meeting-site-url', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  utilsModuleName,
])
  .component('advancedMeetingSiteUrl', new AdvancedMeetingSiteUrlComponent())
  .name;
