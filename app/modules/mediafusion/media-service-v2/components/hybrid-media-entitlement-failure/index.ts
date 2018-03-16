import { HybridMediaEntitlementFailureComponent } from './hybrid-media-entitlement-failure.component';

export default angular.module('mediafusion.media-service-v2.components.hybrid-media-entitlement-failure', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('hybridMediaEntitlementFailure', new HybridMediaEntitlementFailureComponent())
  .name;
