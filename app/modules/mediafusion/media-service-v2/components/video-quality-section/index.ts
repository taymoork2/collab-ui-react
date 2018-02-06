import { VideoQualitySectionComponent } from './video-quality-section.component';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationsModuleName from 'modules/core/notifications';

export default angular
  .module('mediafusion.media-service-v2.components.video-quality-section', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/org.service'),
    hybridServicesClusterServiceModuleName,
    notificationsModuleName,
  ])
  .component('videoQualitySection', new VideoQualitySectionComponent())
  .name;
