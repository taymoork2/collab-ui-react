import './jabber-to-webex-teams-prerequisites-modal.scss';

import { JabberToWebexTeamsPrerequisitesModalComponent } from './jabber-to-webex-teams-prerequisites-modal.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('services-overview.new-hybrid.prerequisites-modals.jabber-to-webex-teams-prerequisites-modal', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('jabberToWebexTeamsPrerequisitesModal', new JabberToWebexTeamsPrerequisitesModalComponent())
  .name;
