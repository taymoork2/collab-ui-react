import './jabber-to-webex-teams-prerequisites-modal.scss';

import { JabberToWebexTeamsPrerequisitesModalComponent } from './jabber-to-webex-teams-prerequisites-modal.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';
import crCheckboxItemModuleName from 'modules/core/shared/cr-checkbox-item';
import notificationModuleName from 'modules/core/notifications';

export default angular.module('services-overview.new-hybrid.prerequisites-modals.jabber-to-webex-teams-prerequisites-modal', [
  ngTranslateModuleName,
  collabUiModuleName,
  crCheckboxItemModuleName,
  notificationModuleName,
])
  .component('jabberToWebexTeamsPrerequisitesModal', new JabberToWebexTeamsPrerequisitesModalComponent())
  .name;
