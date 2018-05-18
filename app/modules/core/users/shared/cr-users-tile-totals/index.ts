import { CrUsersTileTotalsComponent } from './cr-users-tile-totals.component';

// TODO(brspence): replace usage with cr-total-tile-container and remove
export default angular
  .module('core.users.shared.cr-users-tile-totals', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
  ])
  .component('crUsersTileTotals', new CrUsersTileTotalsComponent())
  .name;
