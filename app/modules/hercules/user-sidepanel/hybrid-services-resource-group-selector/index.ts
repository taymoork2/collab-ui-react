import { HybridServicesResourceGroupSelectorComponent } from './hybrid-services-resource-group-selector.component';

require('./_hybrid-services-resource-group-selector.scss');

export default angular
  .module('Hercules')
  .component('hybridServicesResourceGroupSelector', new HybridServicesResourceGroupSelectorComponent())
  .name;
