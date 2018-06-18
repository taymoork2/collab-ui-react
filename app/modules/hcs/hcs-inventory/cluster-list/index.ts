import './cluster-list.scss';
import { ClusterListComponent } from './cluster-list.component';

export default angular
  .module('hcs.clusterList', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hcs/hcs-shared').default,
  ])
  .component('hcsClusterList', new ClusterListComponent())
  .name;
