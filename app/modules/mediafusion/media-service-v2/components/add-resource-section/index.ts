import './add-resource-section.scss';

import { AddResourceSectionComponent } from './add-resource-section.component';
import NotificationModuleName from 'modules/core/notifications';
import hybridServicesExtrasServiceModuleName from 'modules/hercules/services/hybrid-services-extras.service';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import { MediaEncryptionSectionService }  from 'modules/mediafusion/media-service-v2/components/media-encryption-section/media-encryption-section.service';
import { AddResourceSectionService } from './add-resource-section.service';

export default angular.module('mediafusion.media-service-v2.components.add-resource-section', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  NotificationModuleName,
  hybridServicesExtrasServiceModuleName,
  hybridServicesClusterServiceModuleName,
])
  .component('addResourceSection', new AddResourceSectionComponent())
  .service('AddResourceSectionService', AddResourceSectionService)
  .service('MediaEncryptionSectionService', MediaEncryptionSectionService)
  .name;
