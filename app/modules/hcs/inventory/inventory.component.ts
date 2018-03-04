export class InventoryComponent implements ng.IComponentOptions {
  public controller = InventoryCtrl;
  public template = require('./inventory.component.html');
}

export class InventoryCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor() {}

  public $onInit(): void {}
}
