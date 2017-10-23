import { HybridServicesUserHomedClusterAndHostnameComponent } from './hybrid-services-user-homed-cluster-and-hostname.component';
import HybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';

export default angular
  .module('hercules.user-homed-cluster-and-hostname', [
    HybridServicesClusterServiceModuleName,
    require('angular-translate'),
  ])
  .component('hybridServicesUserHomedClusterAndHostname', new HybridServicesUserHomedClusterAndHostnameComponent())
  .name;
