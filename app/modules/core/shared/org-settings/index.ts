import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import { OrgSettingsService } from './org-settings.service';

export default angular.module('core.shared.org-settings', [
  urlConfigModuleName,
])
  .service('OrgSettingsService', OrgSettingsService)
  .name;
