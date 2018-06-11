const MediaServiceControllerV2 = require('modules/mediafusion/media-service-v2/resources/media-service-controller.js');
const MediaClusterServiceV2 = require('modules/mediafusion/media-service-v2/resources/media-cluster-service.js');
import modalServiceModuleName from 'modules/core/modal';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import serviceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';

export default angular
  .module('mediafusion.media-service-v2.resources', [
    authInfoModuleName,
    hybridServicesClusterServiceModuleName,
    modalServiceModuleName,
    serviceDescriptorServiceModuleName,
  ])
  .controller('MediaServiceControllerV2', MediaServiceControllerV2)
  .service('MediaClusterServiceV2', MediaClusterServiceV2)
  .name;
