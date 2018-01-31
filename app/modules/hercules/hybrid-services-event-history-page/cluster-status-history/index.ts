import { HybridServicesClusterStatusHistoryTableComponent } from './cluster-status-history-table.component';
import { HybridServicesClusterStatusHistorySidepanelComponent } from './cluster-status-history-sidepanel.component';
import './_cluster-status-history.scss';
import hybridServicesEventHistoryServiceModuleName from 'modules/hercules/services/hybrid-services-event-history.service';

export default angular
  .module('hercules.event-history-page.cluster-status-history', [
    require('angular-ui-router'),
    require('angular-translate'),
    hybridServicesEventHistoryServiceModuleName,
  ])
  .component('hybridServicesClusterStatusHistoryTable', new HybridServicesClusterStatusHistoryTableComponent())
  .component('hybridServicesClusterStatusHistorySidepanel', new HybridServicesClusterStatusHistorySidepanelComponent())
  .name;
