import { HybridMediaClusterSettingsComponent } from './hybrid-media-cluster-settings.component';
import ClusterServiceModuleName from 'modules/hercules/services/cluster-service';
import HybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import NotificationModuleName from 'modules/core/notifications';
import './_hybrid-media-cluster-settings.scss';

export default angular
  .module('hercules.hybrid-media-cluster-settings', [
    ClusterServiceModuleName,
    HybridServicesClusterServiceModuleName,
    NotificationModuleName,
  ])
  .component('hybridMediaClusterSettings', new HybridMediaClusterSettingsComponent())
  .name;
