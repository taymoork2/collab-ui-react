import { HybridServicesNodesPageComponent } from './hybrid-services-nodes-page.component';
import connectorUpgradeBannerModuleName from './connector-upgrade-banner';

require('./hybrid-services-nodes-page.scss');

export default angular
  .module('hercules.nodes-page', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('angular-ui-router'),
    require('modules/core/analytics'),
    require('modules/hercules/services/hybrid-services-cluster.service').default,
    require('modules/hercules/services/hybrid-services-utils.service').default,
    require('modules/core/modal').default,
    require('modules/core/notifications').default,
    connectorUpgradeBannerModuleName,
  ])
  .component('hybridServicesNodesPage', new HybridServicesNodesPageComponent())
  .name;
