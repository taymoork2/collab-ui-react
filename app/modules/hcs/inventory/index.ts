import './inventory.scss';
import { InventoryListComponent } from './inventory.component';

export default angular
  .module('hcs.inventory', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
.component('hcsInventory', new InventoryListComponent())
.name;
