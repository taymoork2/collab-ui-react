import { SipRegistrationSectionComponent } from './sip-registration-section.component';
import { SipRegistrationSectionService } from './sip-registration-section.service';
import notificationsModuleName from 'modules/core/notifications';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
export * from './sip-registration-section.service';

export default angular
  .module('mediafusion.media-service-v2.components.sip-registration-section', [
    notificationsModuleName,
    hybridServicesClusterServiceModuleName,
  ])
  .component('sipRegistrationSection', new SipRegistrationSectionComponent())
  .service('SipRegistrationSectionService', SipRegistrationSectionService)
  .name;
