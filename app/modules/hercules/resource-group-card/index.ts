import { ResourceGroupCardComponent } from './hs-resource-group-card.component';

import hybridServicesClusterStatesServiceModule from 'modules/hercules/services/hybrid-services-cluster-states.service';
import hybridServicesI18NServiceModule from 'modules/hercules/services/hybrid-services-i18n.service';

import './_hs-resource-group-card.scss';

export default angular
  .module('hercules.resource-group-card', [
    require('@collabui/collab-ui-ng').default,
    hybridServicesClusterStatesServiceModule,
    hybridServicesI18NServiceModule,
  ])
  .component('hsResourceGroupCard', new ResourceGroupCardComponent())
  .name;
