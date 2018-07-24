import './jabber-to-webex-teams-add-profile-modal.scss';

import { JabberToWebexTeamsAddProfileModalComponent } from './jabber-to-webex-teams-add-profile-modal.component';
import { JabberToWebexTeamsService } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.service';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';
import * as analyticsModuleName from 'modules/core/analytics';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';

export default angular.module('services-overview.new-hybrid.jabber-to-webex-teams-add-profile-modal', [
  ngTranslateModuleName,
  collabUiModuleName,
  analyticsModuleName,
  authInfoModuleName,
  multiStepModalModuleName,
])
  .component('jabberToWebexTeamsAddProfileModal', new JabberToWebexTeamsAddProfileModalComponent())
  .service('JabberToWebexTeamsService', JabberToWebexTeamsService)
  .name;
