import { RoutingPrefixLengthComponent } from './settings-routing-prefix-length.component';
import routingPrefixModalModule from './settings-routing-prefix-length-modal';
import settingsServiceModule from 'modules/call/settings/shared';
import modalServiceModule from 'modules/core/modal';

export { RoutingPrefixLengthComponent };

export default angular
  .module('call.settings.routing-prefix-length', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    routingPrefixModalModule,
    settingsServiceModule,
    modalServiceModule,
  ])
  .component('ucRoutingPrefixLength', new RoutingPrefixLengthComponent())
  .name;
