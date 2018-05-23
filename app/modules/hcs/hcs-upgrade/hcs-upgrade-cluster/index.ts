import './upgrade-group.scss';
import { UpgradeClusterComponent } from './hcs-upgrade-cluster.component';

export default angular
  .module('hcs.upgradeClusterGrid', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
.component('hcsUpgradeCluster', new UpgradeClusterComponent())
.name;
