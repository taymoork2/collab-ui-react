import './upgrade-group.scss';
import { UpgradeGroupComponent } from './upgrade-group.component';
import { UpgradeClusterGridComponent } from './upgrade-cluster-grid.component';

export default angular
  .module('hcs.upgradeClusterGrid', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
.component('hcsUpgradeGroup', new UpgradeGroupComponent())
.component('hcsUpgradeClusterGrid', new UpgradeClusterGridComponent())
.name;
