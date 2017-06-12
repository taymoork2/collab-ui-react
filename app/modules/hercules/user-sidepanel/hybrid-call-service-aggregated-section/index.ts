import { HybridCallServiceAggregatedSectionComponent } from './hybrid-call-service-aggregated-section.component';

require('./_hybrid-call-service-aggregated-section.scss');

export default angular
  .module('Hercules')
  .component('hybridCallServiceAggregatedSection', new HybridCallServiceAggregatedSectionComponent())
  .name;
