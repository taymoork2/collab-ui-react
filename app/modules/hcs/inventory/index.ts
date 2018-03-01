import { InventoryComponent } from './inventory.component';

export default angular
  .module('hcs.inventory', [])
.component('hcsInventory', new InventoryComponent())
.name;
