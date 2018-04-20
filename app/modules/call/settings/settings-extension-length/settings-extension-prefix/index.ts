import './settings-extension-prefix.component.scss';

import { ExtensionPrefixComponent } from './settings-extension-prefix.component';
import notifications from 'modules/core/notifications';
import huronSettingsServiceModule from 'modules/call/settings/shared';
import locationsServiceModule from 'modules/call/locations/shared';
import customerConfigCesModule from 'modules/call/shared/customer-config-ces' ;

export default angular
  .module('call.settings.extension-prefix', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
    notifications,
    huronSettingsServiceModule,
    locationsServiceModule,
    customerConfigCesModule,
  ])
  .component('ucExtensionPrefixModal', new ExtensionPrefixComponent())
  .name;
