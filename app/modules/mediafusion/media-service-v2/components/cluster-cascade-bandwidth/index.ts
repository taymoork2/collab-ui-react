import './cluster-cascade-bandwidth.scss';

import { ClusterCascadeBandwidthComponent } from './cluster-cascade-bandwidth.component';
import { ClusterCascadeBandwidthService } from './cluster-cascade-bandwidth.service';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import notificationsModuleName from 'modules/core/notifications';

export default angular.module('mediafusion.media-service-v2.components.cluster-cascade-bandwidth', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  hybridServicesClusterServiceModuleName,
  notificationsModuleName,
])
  .component('clusterCascadeBandwidth', new ClusterCascadeBandwidthComponent())
  .service('ClusterCascadeBandwidthService', ClusterCascadeBandwidthService)
  .name;
