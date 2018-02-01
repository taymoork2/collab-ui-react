import { TrustedSipSectionComponent } from './trusted-sip-section.component';
import notificationsModuleName from 'modules/core/notifications';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';

export default angular
  .module('mediafusion.media-service-v2.components.trusted-sip-section', [
    notificationsModuleName,
    hybridServicesClusterServiceModuleName,
  ])
  .component('trustedSipSection', new TrustedSipSectionComponent())
  .name;
