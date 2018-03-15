import './inventory.scss';
import { InventoryComponent } from './inventory.component';

export default angular
  .module('hcs.inventory', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
.component('hcsInventory', new InventoryComponent())
.name;
