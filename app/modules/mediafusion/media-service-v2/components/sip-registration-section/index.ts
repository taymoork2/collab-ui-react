import { SipRegistrationSectionComponent } from './sip-registration-section.component';
import notificationsModuleName from 'modules/core/notifications';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';

export default angular
  .module('mediafusion.media-service-v2.components.sip-registration-section', [
    notificationsModuleName,
    hybridServicesClusterServiceModuleName,
  ])
  .component('sipRegistrationSection', new SipRegistrationSectionComponent())
  .name;
