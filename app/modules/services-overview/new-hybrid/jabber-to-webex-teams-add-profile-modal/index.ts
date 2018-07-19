import './jabber-to-webex-teams-add-profile-modal.scss';

import { JabberToWebexTeamsAddProfileModalComponent } from './jabber-to-webex-teams-add-profile-modal.component';
import { JabberProfileService } from 'modules/services-overview/new-hybrid/shared/jabber-to-webex-teams.service';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('services-overview.new-hybrid.jabber-to-webex-teams-add-profile-modal', [
  ngTranslateModuleName,
  collabUiModuleName,
  require('modules/core/scripts/services/authinfo'),
])
  .component('jabberToWebexTeamsAddProfileModal', new JabberToWebexTeamsAddProfileModalComponent())
  .service('JabberProfileService', JabberProfileService)
  .name;
