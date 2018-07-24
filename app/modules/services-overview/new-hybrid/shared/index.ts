
import { JabberToWebexTeamsService } from './jabber-to-webex-teams.service';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';
import storageModuleName from 'modules/core/storage';

export default angular.module('services-overview.new-hybrid.shared', [
  ngTranslateModuleName,
  collabUiModuleName,
  require('modules/core/scripts/services/authinfo'),
  storageModuleName,
])
  .service('JabberToWebexTeamsService', JabberToWebexTeamsService)
  .name;
