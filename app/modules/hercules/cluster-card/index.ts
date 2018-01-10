import { ClusterCardComponent } from './hs-cluster-card.component';

import featureToggleModule from 'modules/core/featureToggle';
import hybridServicesI18NServiceModule from 'modules/hercules/services/hybrid-services-i18n.service';
import hybridServicesUtilsServiceModule from 'modules/hercules/services/hybrid-services-utils.service';
import modalModule from 'modules/core/modal';

import './_hs-cluster-card.scss';

export default angular
  .module('hercules.cluster-card', [
    require('@collabui/collab-ui-ng').default,
    featureToggleModule,
    hybridServicesI18NServiceModule,
    hybridServicesUtilsServiceModule,
    modalModule,
  ])
  .component('hsClusterCard', new ClusterCardComponent())
  .name;
