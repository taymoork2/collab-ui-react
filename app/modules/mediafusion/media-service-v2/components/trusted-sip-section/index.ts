import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationsModuleName from 'modules/core/notifications';
import { TrustedSipSectionComponent } from './trusted-sip-section.component';
import { TrustedSipSectionService } from './trusted-sip-section.service';

export default angular
  .module('mediafusion.media-service-v2.components.trusted-sip-section', [
    notificationsModuleName,
    hybridServicesClusterServiceModuleName,
  ])
  .component('trustedSipSection', new TrustedSipSectionComponent())
  .service('TrustedSipSectionService', TrustedSipSectionService)
  .name;
