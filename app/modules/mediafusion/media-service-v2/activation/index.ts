const MediaServiceActivationV2 = require('modules/mediafusion/media-service-v2/activation/media-service-activation-service.js');
import notificationModuleName from 'modules/core/notifications';
import serviceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';

export default angular
  .module('mediafusion.media-service-v2.activation', [
    notificationModuleName,
    serviceDescriptorServiceModuleName,
  ])
  .service('MediaServiceActivationV2', MediaServiceActivationV2)
  .name;
