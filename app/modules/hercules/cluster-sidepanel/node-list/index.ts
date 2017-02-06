import { NodeListComponent } from './node-list.component';

require('./_node-list.scss');

export default angular
  .module('Hercules')
  .component('hybridServicesNodeList', new NodeListComponent())
  .name;
