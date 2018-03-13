interface IInventoryObject {
  id: string;
  name?: string;
  clusterCount: number;
  status: string;
}
interface IFilterObject {
  value?: any;
  label: string | undefined;
  menu?: any;
  isSelected?: boolean;
}
interface IFilterComponent {
  selected: IFilterObject[];
  placeholder: string;
  singular: string;
  plural: string;
  options: IFilterObject[];
}

export class InventoryComponent implements ng.IComponentOptions {
  public controller = InventoryCtrl;
  public template = require('./inventory.component.html');
}

export class InventoryCtrl implements ng.IComponentController {
  private timer;
  private timeoutVal: number;
  private tempFilterOptions: (string| undefined)[];

  public inventoryList: IInventoryObject[] = [];
  public inventoryListData: IInventoryObject[] = [];
  public filter: IFilterComponent = {
    selected: [],
    placeholder: this.$translate.instant('customerPage.filters.placeholder'),
    singular: this.$translate.instant('customerPage.filters.filter'),
    plural: this.$translate.instant('customerPage.filters.filters'),
    options: [],
  };

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
  ) {
    this.timer = 0;
    this.timeoutVal = 1000;
  }

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
    this.inventoryListData = this.inventoryList;
    this.tempFilterOptions = _.uniq(this.inventoryList.map(item => _.get(item, 'status')));
    this.tempFilterOptions.map(filterOption => {
      this.filter.options.push({
        value: filterOption,
        label: filterOption,
      });
    });
  }

  public onChangeFilters(): void {
    //implement filter function.
    if (this.filter.selected.length >= 1) {
      this.inventoryListData = this.inventoryList.filter(inventory => {
        let present: boolean = false;
        this.filter.selected.forEach(selected => {
          if (selected.value) {
            if (selected.value === inventory.status) {
              present = true;
            }
          }
        });
        return present;
      });
    } else {
      this.inventoryListData = this.inventoryList;
    }
  }

  public searchInventoryList(str) {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }

    this.timer = this.$timeout(() => {
      //CI requires search strings to be at least three characters
      this.inventoryListData = this.inventoryList;
      if (this.filter.selected.length >= 1) {
        this.onChangeFilters();
      }
      if (str.length >= 1 || str === '') {
        //search function
        this.inventoryListData = this.inventoryListData.filter(inventory => {
          const inventoryName = _.get(inventory, 'name', 'Unassigned');
          return (_.includes(inventoryName.toLowerCase(), str.toLowerCase()));
        });
      }
    }, this.timeoutVal);
  }
}
