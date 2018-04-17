import { CallServiceConnectPrerequisitesComponent } from './call-service-connect-prerequisites.component';
import ServiceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';
import HybridServicesPrerequisitesHelperServiceModuleName from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import NotificationModuleName from 'modules/core/notifications';
import '../_common-hybrid-prerequisites.scss';

export default angular
  .module('services-overview.call-service-connect-prerequisites', [
    HybridServicesPrerequisitesHelperServiceModuleName,
    NotificationModuleName,
    ServiceDescriptorServiceModuleName,
  ])
  .component('callServiceConnectPrerequisites', new CallServiceConnectPrerequisitesComponent())
  .name;
