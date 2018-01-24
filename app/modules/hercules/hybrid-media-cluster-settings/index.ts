import { HybridMediaClusterSettingsComponent } from './hybrid-media-cluster-settings.component';
import HybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import NotificationModuleName from 'modules/core/notifications';
import './_hybrid-media-cluster-settings.scss';

export default angular
  .module('hercules.hybrid-media-cluster-settings', [
    HybridServicesClusterServiceModuleName,
    NotificationModuleName,
  ])
  .component('hybridMediaClusterSettings', new HybridMediaClusterSettingsComponent())
  .name;
