import { HcsUpgradeSwprofileListComponent } from './hcs-upgrade-swprofile-list.component';

export default angular
.module('hcs.swprofilelist', [
  require('@collabui/collab-ui-ng').default,
  require('angular-translate'),
])
.component('hcsUpgradeSwprofileList', new HcsUpgradeSwprofileListComponent())
.name;
