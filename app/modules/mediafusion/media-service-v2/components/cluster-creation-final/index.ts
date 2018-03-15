import { ClusterCreationFinalComponent } from './cluster-creation-final.component';

export default angular.module('mediafusion.media-service-v2.components.cluster-creation-final', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
])
  .component('clusterCreationFinal', new ClusterCreationFinalComponent())
  .name;
