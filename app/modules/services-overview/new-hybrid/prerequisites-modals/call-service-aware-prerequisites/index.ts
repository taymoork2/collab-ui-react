import { CallServiceAwarePrerequisitesComponent } from './call-service-aware-prerequisites.component';
import HybridServicesPrerequisitesHelperServiceModuleName from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import NotificationModuleName from 'modules/core/notifications';
import '../_common-hybrid-prerequisites.scss';

export default angular
  .module('services-overview.call-service-aware-prerequisites', [
    HybridServicesPrerequisitesHelperServiceModuleName,
    NotificationModuleName,
  ])
  .component('callServiceAwarePrerequisites', new CallServiceAwarePrerequisitesComponent())
  .name;
