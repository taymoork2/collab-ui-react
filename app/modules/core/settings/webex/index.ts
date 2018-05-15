import { WebexSettingsWrapper } from './webex-settings-wrapper.component';
import webexVersionModule from './webexVersion';
import webexSiteManagement from './webexSiteManagement';

export default angular.module('core.settings.webex', [
  webexVersionModule,
  webexSiteManagement,
])
  .component('webexSettingsWrapper', new WebexSettingsWrapper())
  .name;
