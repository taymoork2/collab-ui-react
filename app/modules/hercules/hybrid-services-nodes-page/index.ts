import { HybridServicesNodesPageComponent } from './hybrid-services-nodes-page.component';

require('./_hybrid-services-nodes-page.scss');

export default angular
  .module('Hercules')
  .component('hybridServicesNodesPage', new HybridServicesNodesPageComponent())
  .name;
