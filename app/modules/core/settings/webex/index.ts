import { WebexSettingsWrapper } from './webex-settings-wrapper.component';

export default angular.module('core.settings.webex', [])
  .component('webexSettingsWrapper', new WebexSettingsWrapper())
  .name;
