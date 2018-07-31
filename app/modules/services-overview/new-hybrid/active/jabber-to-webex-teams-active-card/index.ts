import './jabber-to-webex-teams-active-card.scss';

import { JabberToWebexTeamsActiveCardComponent } from './jabber-to-webex-teams-active-card.component';
import { JabberToWebexTeamsService } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.service';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';

export default angular.module('services-overview.new-hybrid.active.jabber-to-webex-teams-active-card', [
  ngTranslateModuleName,
  collabUiModuleName,
  authInfoModuleName,
  urlConfigModuleName,
])
  .component('jabberToWebexTeamsActiveCard', new JabberToWebexTeamsActiveCardComponent())
  .service('JabberToWebexTeamsService', JabberToWebexTeamsService)
  .name;
