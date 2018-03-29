interface IHeaderTab {
  title: string;
  state: string;
}

export class ClusterListComponent implements ng.IComponentOptions {
  public controller = ClusterListCtrl;
  public template = require('./cluster-list.component.html');
  public bindings = {
    groupId: '<',
    groupType: '<',
  };
}

export class ClusterListCtrl implements ng.IComponentController {
  public groupId: string;
  public groupType: string;
  public groupName: string;
  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'hcs.shared.inventoryList';
  public clusterList;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    this.tabs.push({
      title: this.$translate.instant('hcs.clustersList.title'),
      state: `hcs.clusterList({groupId: '${this.groupId}', groupType: '${this.groupType}'})`,
    }, {
      title: this.$translate.instant('hcs.upgradePage.title'),
      state: `hcs.upgradeGroup({customerId: '${this.groupId}'})`,
    });
    if (this.groupType === 'unassigned') {
      //get customer name from api
      this.groupName = 'Unassigned';
      //get cluster list from controller api??
      this.clusterList = [{
        id: 'a1234',
        name: 'un-cucm-f3',
        type: 'CUCM',
        nodes: [
          {
            name: 'ccm-c992',
            type: 'Pub',
            status: 'Needs Accepted',
          }, {
            name: 'ccm-c01',
            type: 'Sub',
            status: 'Needs Accepted',
          },
        ],
      }, {
        id: 'x5678',
        name: 'asdf-imp-c1',
        type: 'IM&P',
        nodes: [
          {
            name: 'adadse-02',
            type: 'Pub',
            status: 'Needs Accepted',
          }, {
            name: 'adsfaj-01',
            type: 'Sub',
            status: 'Needs Accepted',
          },
        ],
      }, {
        id: 'b1920',
        name: 'edlid-uxcn-c2',
        type: 'UXCN',
        nodes: [
          {
            name: 'kkiido-02',
            type: 'Pub',
            status: 'Needs Accepted',
          }, {
            name: 'jkleld-01',
            type: 'Sub',
            status: 'Needs Accepted',
          },
        ],
      }, {
        id: 'm1212',
        name: 'adfve-uxcn-c2',
        type: 'UXCN',
        nodes: [
          {
            name: 'kkiido-02',
            type: 'Pub',
            status: 'Needs Accepted',
          },
          {
            name: 'jkleld-01',
            type: 'Sub',
            status: 'Needs Accepted',
          },
        ],
      }, {
        id: 'x1212',
        name: 'asdasdas-uxcn-c2',
        type: 'UXCN',
        nodes: [
          {
            name: 'kkiido-02',
            type: 'Pub',
            status: 'Needs Accepted',
          },
          {
            name: 'jkleld-01',
            type: 'Sub',
            status: 'Needs Accepted',
          },
        ],
      }];
    } else {
      //get customer name from api
      this.groupName = 'Betty\'s Flower Shop';
      //get cluster list from upgrade api
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
}
