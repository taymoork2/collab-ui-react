import { RenameAndDeregisterClusterSectionComponent } from './hs-rename-and-deregister-cluster.component';
import FeatureToggleServiceModuleName from 'modules/core/featureToggle';
import PrivateTrunkServiceModuleName from 'modules/hercules/private-trunk/private-trunk-services';
import NotificationModuleName from 'modules/core/notifications';
import HybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import ModalServiceModuleName from 'modules/core/modal';
import NotificationServiceModuleName from 'modules/core/notifications';
import { ClusterDeregisterController } from './cluster-deregister-controller';

export default angular
  .module('hercules.rename-and-deregister-cluster', [
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
  .component('hsRenameAndDeregisterClusterSection', new RenameAndDeregisterClusterSectionComponent())
  .name;
