import './media-encryption-section.scss';

import { MediaEncryptionSectionComponent } from './media-encryption-section.component';
import { MediaEncryptionSectionService } from './media-encryption-section.service';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationsModuleName from 'modules/core/notifications';

export default angular
  .module('mediafusion.media-service-v2.components.media-encryption-section', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/org.service'),
    require('modules/mediafusion/media-service-v2/resources').default,
    hybridServicesClusterServiceModuleName,
    notificationsModuleName,
  ])
  .component('mediaEncryptionSection', new MediaEncryptionSectionComponent())
  .service('MediaEncryptionSectionService', MediaEncryptionSectionService)
  .name;
