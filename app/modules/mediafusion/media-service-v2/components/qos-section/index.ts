import './qos-section.scss';

import { QosSectionComponent, QosSectionCtrl } from './qos-section.component';
import { QosSectionService } from './qos-section.service';
import { QosStatusController } from './qos-status-controller';
import { QosNodesController } from './qos-nodes-controller';
import { AddResourceSectionService }  from 'modules/mediafusion/media-service-v2/components/add-resource-section/add-resource-section.service';
import addResourceSectionServiceModuleName  from 'modules/mediafusion/media-service-v2/components/add-resource-section';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationsModuleName from 'modules/core/notifications';

export default angular
  .module('mediafusion.media-service-v2.components.qos-section', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/org.service'),
    require('modules/mediafusion/media-service-v2/resources').default,
    addResourceSectionServiceModuleName,
    hybridServicesClusterServiceModuleName,
    notificationsModuleName,
  ])
  .component('qosSection', new QosSectionComponent())
  .controller('QosSectionCtrl', QosSectionCtrl)
  .controller('QosStatusController', QosStatusController)
  .controller('QosNodesController', QosNodesController)
  .service('QosSectionService', QosSectionService)
  .service('AddResourceSectionService', AddResourceSectionService)
  .name;
