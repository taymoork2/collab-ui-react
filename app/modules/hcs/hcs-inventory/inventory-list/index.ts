import './inventory-list.scss';
import { InventoryListComponent } from './inventory-list.component';

export default angular
  .module('hcs.inventoryList', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hcs/hcs-shared').default,
  ])
  .component('hcsInventoryList', new InventoryListComponent())
  .name;
