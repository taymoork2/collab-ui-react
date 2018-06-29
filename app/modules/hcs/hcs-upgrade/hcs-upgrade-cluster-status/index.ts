import './hcs-upgrade-cluster-status.scss';
import { UpgradeClusterStatusComponent } from './hcs-upgrade-cluster-status.component';

export default angular
  .module('hcs.upgradeClusterStatus', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hcs/hcs-shared').default,
    require('modules/core/csgrid').default,
  ])
  .component('hcsUpgradeClusterStatus', new UpgradeClusterStatusComponent())
  .name;
