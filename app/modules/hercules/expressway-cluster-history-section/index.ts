import { ExpresswayClusterHistorySectionComponent } from './expressway-cluster-history-section.component';

require('./_expressway-cluster-history-section.scss');

export default angular
  .module('Hercules')
  .component('expresswayClusterHistorySection', new ExpresswayClusterHistorySectionComponent())
  .name;
