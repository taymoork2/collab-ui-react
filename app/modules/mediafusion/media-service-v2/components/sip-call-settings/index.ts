import { SipCallSettingsComponent } from './sip-call-settings.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';

export default angular.module('mediafusion.media-service-v2.components.sip-call-settings', [
  ngTranslateModuleName,
  collabUiModuleName,
])
  .component('sipCallSettings', new SipCallSettingsComponent())
  .name;
