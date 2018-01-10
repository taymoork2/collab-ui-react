import { CrUsersTileTotalsComponent } from './cr-users-tile-totals.component';

export default angular
  .module('core.users.shared.cr-users-tile-totals', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
  ])
  .component('crUsersTileTotals', new CrUsersTileTotalsComponent())
  .name;
