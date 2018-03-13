import { HybridServicesEventHistoryPageComponent } from './hybrid-services-event-history-page.component';
import './hybrid-services-event-history-page.scss';
import featureToggleServiceModuleName from 'modules/core/featureToggle';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationModuleName from 'modules/core/notifications';

export default angular
  .module('hercules.event-history-page', [
    require('angular-translate'),
    featureToggleServiceModuleName,
    hybridServicesClusterServiceModuleName,
    notificationModuleName,
  ])
  .component('hybridServicesEventHistoryPage', new HybridServicesEventHistoryPageComponent())
  .name;
