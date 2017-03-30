import { ExtensionLengthComponent } from './extensionLength.component';

export * from './extensionLength.component';

export default angular
  .module('huron.settings.extension-length', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucExtensionLength', new ExtensionLengthComponent())
  .name;
