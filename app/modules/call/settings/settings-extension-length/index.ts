import { ExtensionLengthComponent } from './settings-extension-length.component';
import extensionPrefixModule from './settings-extension-prefix';
import settingsServiceModule from 'modules/call/settings/shared';
import modalServiceModule from 'modules/core/modal';

export { ExtensionLengthComponent };

export default angular
  .module('call.settings.extension-length', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    extensionPrefixModule,
    settingsServiceModule,
    modalServiceModule,
  ])
  .component('ucExtensionLength', new ExtensionLengthComponent())
  .name;
