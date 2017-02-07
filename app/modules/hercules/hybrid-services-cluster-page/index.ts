import { HybridServicesClusterPageComponent } from './hybrid-services-cluster-page.component';

require('./_hybrid-services-cluster-page.scss');

export default angular
  .module('Hercules')
  .component('hybridServicesClusterPage', new HybridServicesClusterPageComponent())
  .name;
