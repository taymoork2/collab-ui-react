import { ClusterSectionComponent } from './hs-cluster-section.component';
import FeatureToggleServiceModuleName from 'modules/core/featureToggle';
import PrivateTrunkServiceModuleName from 'modules/hercules/private-trunk/private-trunk-services';
import NotificationModuleName from 'modules/core/notifications';
import HybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import ModalServiceModuleName from 'modules/core/modal';
import NotificationServiceModuleName from 'modules/core/notifications';
import { ClusterDeregisterController } from './cluster-deregister-controller';

export default angular
  .module('hercules.hs-cluster-section', [
    ModalServiceModuleName,
    require('angular-ui-router'),
    require('angular-translate'),
    HybridServicesClusterServiceModuleName,
    NotificationModuleName,
    PrivateTrunkServiceModuleName,
    FeatureToggleServiceModuleName,
    NotificationServiceModuleName,
  ])
  .controller('ClusterDeregisterController', ClusterDeregisterController)
  .component('hsClusterSection', new ClusterSectionComponent())
  .name;
