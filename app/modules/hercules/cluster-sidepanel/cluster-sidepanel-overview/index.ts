import './_cluster-sidepanel-overview.scss';
import { ClusterSidepanelOverviewComponent } from './cluster-sidepanel-overview.controller';

export default angular
  .module('Hercules')
  .component('clusterSidepanelOverview', new ClusterSidepanelOverviewComponent());
