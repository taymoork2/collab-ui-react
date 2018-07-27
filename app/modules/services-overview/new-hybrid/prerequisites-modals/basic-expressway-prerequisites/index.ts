import { BasicExpresswayPrerequisitesComponent } from './basic-expressway-prerequisites.component';
import HybridServicesPrerequisitesHelperServiceModuleName from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import NotificationModuleName from 'modules/core/notifications';
import '../_common-hybrid-prerequisites.scss';

export default angular
  .module('services-overview.basic-expressway-prerequisites', [
    HybridServicesPrerequisitesHelperServiceModuleName,
    NotificationModuleName,
  ])
  .component('basicExpresswayPrerequisites', new BasicExpresswayPrerequisitesComponent())
  .name;