interface IInventoryObject {
  id: string;
  name?: string;
  clusterCount: number;
  status: string;
}

export class InventoryComponent implements ng.IComponentOptions {
  public controller = InventoryCtrl;
  public template = require('./inventory.component.html');
}

export class InventoryCtrl implements ng.IComponentController {
  public placeholder = {
    name: this.$translate.instant('common.all'),
    filterValue: 'all',
    count: 0,
  };
  public inventoryList: IInventoryObject[] = [];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): void {
    this.inventoryList.push({
      id: 'ax1234b',
      clusterCount: 6,
      status: 'Needs Assigned',
    }, {
      id: 'ax1235b',
      name: 'Susan\'s Mixing Company',
      clusterCount: 4,
      status: 'Needs Accepted',
    }, {
      id: 'ax1231c',
      name: 'Betty\'s Flower Shop',
      clusterCount: 4,
      status: 'Active',
    }, {
      id: 'ax12345',
      name: 'Mary\'s Bar',
      clusterCount: 4,
      status: 'Active',
    }, {
      id: 'ax1236r',
      name: 'Roger\'s Burgers',
      clusterCount: 4,
      status: 'Agent Inactive',
    }, {
      id: 'ax1235m',
      name: 'Jays BBQ',
      clusterCount: 4,
      status: 'Active',
    }, {
      id: 'ax1239x',
      name: 'Wally World',
      clusterCount: 4,
      status: 'Active',
    });
  }

  public filterList(): void {
    //implement search function.
  }
}
