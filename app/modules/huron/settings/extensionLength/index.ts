import { ExtensionLengthComponent } from './extensionLength.component';
import extensionPrefixModule from './extensionPrefix';
import settingsServiceModule from 'modules/huron/settings/services';
import modalServiceModule from 'modules/core/modal';

export * from './extensionLength.component';

export default angular
  .module('huron.settings.extension-length', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    extensionPrefixModule,
    settingsServiceModule,
    modalServiceModule,
  ])
  .component('ucExtensionLength', new ExtensionLengthComponent())
  .name;
