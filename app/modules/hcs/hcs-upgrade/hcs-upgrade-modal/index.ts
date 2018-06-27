import { HcsUpgradeModalComponent } from './hcs-upgrade-modal.component';
import { HcsUpgradeInfoComponent } from './hcs-upgrade-info/hcs-upgrade-info.component';
import { HcsUpgradeOrderComponent } from './hcs-upgrade-order/hcs-upgrade-order.component';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';

import './_hcs-upgrade-modal.scss';

export default angular
  .module('hcs.upgradeModal', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hcs/hcs-shared').default,
    multiStepModalModuleName,
  ])
  .component('hcsUpgradeModal', new HcsUpgradeModalComponent())
  .component('hcsUpgradeInfo', new HcsUpgradeInfoComponent())
  .component('hcsUpgradeOrder', new HcsUpgradeOrderComponent())
  .name;
