import './cluster-detail.scss';
import { ClusterDetailComponent } from './cluster-detail.component';
import { HcsNodeSftpEditComponent } from './hcs-node-sftp-edit.component';
import { HcsAddCustomerToClusterComponent } from './hcs-add-customer-to-cluster.component';

export default angular
  .module('hcs.clusterDetail', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
.component('hcsClusterDetail', new ClusterDetailComponent())
.component('hcsNodeSftpEdit', new HcsNodeSftpEditComponent())
.component('hcsAddCustomerToCluster', new HcsAddCustomerToClusterComponent())
.name;
