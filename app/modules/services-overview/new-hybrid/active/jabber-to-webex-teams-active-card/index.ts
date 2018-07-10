import './jabber-to-webex-teams-active-card.scss';

import { JabberToWebexTeamsActiveCardComponent } from './jabber-to-webex-teams-active-card.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('services-overview.new-hybrid.active.jabber-to-webex-teams-inactive-card', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('jabberToWebexTeamsActiveCard', new JabberToWebexTeamsActiveCardComponent())
  .name;
