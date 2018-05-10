import { OrgSettingsService } from './org-settings.service';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';

export default angular.module('', [
  urlConfigModuleName,
])
  .service('OrgSettingsService', OrgSettingsService)
  .name;
