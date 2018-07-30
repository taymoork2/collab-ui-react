
import { JabberToWebexTeamsService } from './jabber-to-webex-teams.service';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';
import storageModuleName from 'modules/core/storage';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';

export default angular.module('services-overview.new-hybrid.shared', [
  ngTranslateModuleName,
  collabUiModuleName,
  require('modules/core/scripts/services/authinfo'),
  storageModuleName,
  urlConfigModuleName,
])
  .service('JabberToWebexTeamsService', JabberToWebexTeamsService)
  .name;
