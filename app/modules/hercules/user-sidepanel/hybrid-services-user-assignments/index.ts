import { HybridServicesUserAssignmentsComponent } from './hybrid-services-user-assignments.component';
import HybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';

require('./_hybrid-services-user-assignments.scss');

export default angular
  .module('hercules.user-assignments', [
    HybridServicesClusterServiceModuleName,
    require('angular-translate'),
  ])
  .component('hybridServicesUserAssignments', new HybridServicesUserAssignmentsComponent())
  .name;
