import './hcs-upgrade-cluster-status.scss';
import { UpgradeClusterStatusComponent } from './hcs-upgrade-cluster-status.component';

export default angular
  .module('hcs.upgradeClusterStatus', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
.component('hcsUpgradeClusterStatus', new UpgradeClusterStatusComponent())
.name;
