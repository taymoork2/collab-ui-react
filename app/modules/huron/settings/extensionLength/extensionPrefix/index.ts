import './_extension-prefix.scss';

import { ExtensionPrefixComponent } from './extensionPrefix.component';
import { ExtensionLengthService } from './extensionLength.service';
import notifications from 'modules/core/notifications';

export * from './extensionLength.service';

export default angular
  .module('huron.settings.extension-prefix', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
    notifications,
  ])
  .service('ExtensionLengthService', ExtensionLengthService)
  .component('ucExtensionPrefixModal', new ExtensionPrefixComponent())
  .name;
