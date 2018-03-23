import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationsModuleName from 'modules/core/notifications';
import { HybridMediaReleaseChannelComponent } from './hybrid-media-release-channel.component';
import { HybridMediaReleaseChannelService } from './hybrid-media-release-channel.service';
import './_hybrid-media-release-channel.scss';

export default angular
  .module('mediafusion/media-service-v2/components/hybrid-media-release-channel', [
    notificationsModuleName,
    hybridServicesClusterServiceModuleName,
  ])
  .component('hybridMediaReleaseChannel', new HybridMediaReleaseChannelComponent())
  .service('HybridMediaReleaseChannelService', HybridMediaReleaseChannelService)
  .name;
