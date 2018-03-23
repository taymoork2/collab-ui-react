interface IHeaderTab {
  title: string;
  state: string;
}

export class ClusterListComponent implements ng.IComponentOptions {
  public controller = ClusterListCtrl;
  public template = require('./cluster-list.component.html');
  public bindings = {
    customerId: '<',
  };
}

export class ClusterListCtrl implements ng.IComponentController {
  public customerId: string;
  public customerName: string;
  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'hcs.shared.inventoryList';
  public clusterList;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    //get customer name from api
    this.customerName = 'Betty\'s Flower Shop';
    this.tabs.push({
      title: this.$translate.instant('hcs.clustersList.title'),
      state: `hcs.clusterList({customerId: '${this.customerId}'})`,
    }, {
      title: this.$translate.instant('hcs.upgradePage.title'),
      state: `hcs.upgradeGroup({customerId: '${this.customerId}'})`,
    });

    //get cluster list from api
    this.clusterList = [{
      id: 'a1234',
      name: 'sm-cucm-c1',
      type: 'CUCM',
      nodes: [
        {
          name: 'ccm-01',
          type: 'Pub',
          status: 'Active',
        }, {
          name: 'ccm-02',
          type: 'Sub',
          status: 'Active',
        },
      ],
    }, {
      id: 'x5678',
      name: 'sm-imp-c1',
      type: 'IM&P',
      nodes: [
        {
          name: 'cimp-02',
          type: 'Pub',
          status: 'Active',
        }, {
          name: 'cimp-01',
          type: 'Sub',
          status: 'Active',
        },
      ],
    }, {
      id: 'b1920',
      name: 'sm-uxcn-c2',
      type: 'UXCN',
      nodes: [
        {
          name: 'cuxcn-02',
          type: 'Pub',
          status: 'Active',
        }, {
          name: 'cuxcn-01',
          type: 'Sub',
          status: 'Active',
        },
      ],
    }, {
      id: 'm1212',
      name: 'sm-expr-c2',
      type: 'EXPR-E',
      nodes: [
        {
          name: 'cexpr-01',
          type: '',
          status: 'Active',
        },
      ],
    }];
  }
}
