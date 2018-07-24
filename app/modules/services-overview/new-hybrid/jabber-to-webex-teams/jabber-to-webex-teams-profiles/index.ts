import './jabber-to-webex-teams-profiles.scss';

import { JabberToWebexTeamsProfilesComponent } from './jabber-to-webex-teams-profiles.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';
import modalServiceModuleName from 'modules/core/modal';
import notificationsModuleName from 'modules/core/notifications';
import JabberProfileServiceName from 'modules/services-overview/new-hybrid/shared/';

export default angular.module('services-overview.new-hybrid.jabber-to-webex-teams.jabber-to-webex-teams-profiles', [
  ngTranslateModuleName,
  collabUiModuleName,
  modalServiceModuleName,
  notificationsModuleName,
  JabberProfileServiceName,
])
  .component('jabberToWebexTeamsProfiles', new JabberToWebexTeamsProfilesComponent())
  .name;
