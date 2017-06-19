import './_extension-prefix.scss';

import { ExtensionPrefixComponent } from './extensionPrefix.component';
import notifications from 'modules/core/notifications';
import huronSettingsServiceModule from 'modules/huron/settings/services';

export default angular
  .module('huron.settings.extension-prefix', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
    notifications,
    huronSettingsServiceModule,
  ])
  .component('ucExtensionPrefixModal', new ExtensionPrefixComponent())
  .name;
