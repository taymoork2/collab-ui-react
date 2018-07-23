import './jabber-to-webex-teams-prerequisites-modal.scss';

import { JabberToWebexTeamsPrerequisitesModalComponent } from './jabber-to-webex-teams-prerequisites-modal.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';
import * as analyticsModuleName from 'modules/core/analytics';
import crCheckboxItemModuleName from 'modules/core/shared/cr-checkbox-item';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import notificationModuleName from 'modules/core/notifications';

export default angular.module('services-overview.new-hybrid.prerequisites-modals.jabber-to-webex-teams-prerequisites-modal', [
  ngTranslateModuleName,
  collabUiModuleName,
  analyticsModuleName,
  crCheckboxItemModuleName,
  multiStepModalModuleName,
  notificationModuleName,
])
  .component('jabberToWebexTeamsPrerequisitesModal', new JabberToWebexTeamsPrerequisitesModalComponent())
  .name;
