import './settings-extension-prefix.component.scss';

import { ExtensionPrefixComponent } from './settings-extension-prefix.component';
import notifications from 'modules/core/notifications';
import huronSettingsServiceModule from 'modules/call/settings/shared';
import locationsServiceModule from 'modules/call/locations/shared';

export default angular
  .module('call.settings.extension-prefix', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
    notifications,
    huronSettingsServiceModule,
    locationsServiceModule,
  ])
  .component('ucExtensionPrefixModal', new ExtensionPrefixComponent())
  .name;
