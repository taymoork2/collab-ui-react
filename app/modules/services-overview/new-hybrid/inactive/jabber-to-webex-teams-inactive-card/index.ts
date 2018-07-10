import './jabber-to-webex-teams-inactive-card.scss';

import { JabberToWebexTeamsInactiveCardComponent } from './jabber-to-webex-teams-inactive-card.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('services-overview.new-hybrid.inactive.jabber-to-webex-teams-inactive-card', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('jabberToWebexTeamsInactiveCard', new JabberToWebexTeamsInactiveCardComponent())
  .name;
