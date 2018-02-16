import { UserStatusMessagesComponent } from './user-status-messages.component';
import './_user-status-messages.scss';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import resourceGroupServiceModuleName from 'modules/hercules/services/resource-group.service';

export default angular
  .module('hercules.user-sidepanel.user-status-messages', [
    require('angular-translate'),
    hybridServicesClusterServiceModuleName,
    resourceGroupServiceModuleName,
  ])
  .component('userStatusMessages', new UserStatusMessagesComponent())
  .name;
