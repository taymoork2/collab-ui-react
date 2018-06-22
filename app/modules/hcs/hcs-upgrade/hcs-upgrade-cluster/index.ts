import './hcs-upgrade-cluster.scss';
import { UpgradeClusterComponent } from './hcs-upgrade-cluster.component';

export default angular
  .module('hcs.upgradeCluster', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hcs/hcs-shared').default,
  ])
  .component('hcsUpgradeCluster', new UpgradeClusterComponent())
  .name;
