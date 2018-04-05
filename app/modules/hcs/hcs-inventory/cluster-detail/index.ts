import './cluster-detail.scss';
import { ClusterDetailComponent } from './cluster-detail.component';

export default angular
  .module('hcs.clusterDetail', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
.component('hcsClusterDetail', new ClusterDetailComponent())
.name;
