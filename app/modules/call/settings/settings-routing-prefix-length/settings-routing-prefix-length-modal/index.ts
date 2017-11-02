import './settings-routing-prefix-length-modal.component.scss';

import { RoutingPrefixLengthModalComponent } from './settings-routing-prefix-length-modal.component';
import notifications from 'modules/core/notifications';
import huronSettingsServiceModule from 'modules/call/settings/shared';
import locationsServiceModule from 'modules/call/locations/shared';

export default angular
  .module('call.settings.routing-prefix-length-modal', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('angular-resource'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/huron/telephony/cmiServices'),
    notifications,
    huronSettingsServiceModule,
    locationsServiceModule,
  ])
  .component('ucRoutingPrefixLengthModal', new RoutingPrefixLengthModalComponent())
  .name;
