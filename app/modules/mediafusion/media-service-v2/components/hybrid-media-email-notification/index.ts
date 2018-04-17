import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationsModuleName from 'modules/core/notifications';
import serviceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';
import { HybridMediaEmailNotificationComponent } from './hybrid-media-email-notification.component';
import { HybridMediaEmailNotificationService } from './hybrid-media-email-notification.service';

require('./_hybrid-media-email-notification.scss');

export default angular
  .module('mediafusion/media-service-v2/components/hybrid-media-email-notification', [
    notificationsModuleName,
    hybridServicesClusterServiceModuleName,
    serviceDescriptorServiceModuleName,
  ])
  .component('hybridMediaEmailNotification', new HybridMediaEmailNotificationComponent())
  .service('HybridMediaEmailNotificationService', HybridMediaEmailNotificationService)
  .name;
