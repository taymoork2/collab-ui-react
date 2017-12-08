import { HelpDeskHybridServicesOrgCardComponent } from './help-desk-hybrid-services-org-card.component';
import calendarCloudConnectorModuleName from 'modules/hercules/services/calendar-cloud-connector.service';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import helpdeskModuleName from 'modules/squared/helpdesk';
import notificationModuleName from 'modules/core/notifications';
import './_help-desk-hybrid-services-org-card.scss';

export default angular
  .module('squared.helpdesk.components.hybrid-services-org-card', [
    calendarCloudConnectorModuleName,
    hybridServicesClusterServiceModuleName,
    helpdeskModuleName,
    notificationModuleName,
  ])
  .component('helpDeskHybridServicesOrgCard', new HelpDeskHybridServicesOrgCardComponent())
  .name;
