import { Office365PrerequisitesComponent } from './office-365-prerequisites.component';
import HybridServicesPrerequisitesHelperServiceModuleName from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import NotificationModuleName from 'modules/core/notifications';
import '../_common-hybrid-prerequisites.scss';

export default angular
  .module('services-overview.office-365-prerequisites', [
    HybridServicesPrerequisitesHelperServiceModuleName,
    NotificationModuleName,
  ])
  .component('office365Prerequisites', new Office365PrerequisitesComponent())
  .name;
