import { HybridServicesNodesPageActionsComponent } from './hybrid-services-nodes-page-actions.component';

require('./_hybrid-services-nodes-page-actions.scss');

export default angular
  .module('Hercules')
  .component('hybridServicesNodesPageActions', new HybridServicesNodesPageActionsComponent())
  .name;
