import './inventory-list.scss';
import { InventoryListComponent } from './inventory-list.component';

export default angular
  .module('hcs.inventoryList', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('hcsInventoryList', new InventoryListComponent())
  .name;
