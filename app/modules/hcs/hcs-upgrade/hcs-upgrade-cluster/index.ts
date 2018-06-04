import './hcs-upgrade-cluster.scss';
import { UpgradeClusterComponent } from './hcs-upgrade-cluster.component';

export default angular
  .module('hcs.upgradeCluster', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('hcsUpgradeCluster', new UpgradeClusterComponent())
  .name;
