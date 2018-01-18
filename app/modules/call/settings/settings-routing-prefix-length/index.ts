import { RoutingPrefixLengthComponent } from './settings-routing-prefix-length.component';
import routingPrefixModalModule from './settings-routing-prefix-length-modal';
import settingsServiceModule from 'modules/call/settings/shared';
import modalServiceModule from 'modules/core/modal';
import customerConfigCesModule from 'modules/call/shared/customer-config-ces' ;

export { RoutingPrefixLengthComponent };

export default angular
  .module('call.settings.routing-prefix-length', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    routingPrefixModalModule,
    settingsServiceModule,
    modalServiceModule,
    customerConfigCesModule,
  ])
  .component('ucRoutingPrefixLength', new RoutingPrefixLengthComponent())
  .name;
