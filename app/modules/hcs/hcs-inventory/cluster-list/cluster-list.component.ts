import { IToolkitModalService } from 'modules/core/modal';
import { IApplicationItem, IClusterItem, IHcsClusterSummaryItem, INodeSummaryItem } from 'modules/hcs/shared/hcs-upgrade';

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
  public clusterList: IClusterItem[];
  public responseData: IHcsClusterSummaryItem[];

  public clusterToBeDeleted: IClusterItem;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private $modal: IToolkitModalService,
  ) {}

  public $onInit() {
    this.tabs.push({
      title: this.$translate.instant('hcs.clustersList.title'),
      state: `hcs.clusterList({groupId: '${this.groupId}', groupType: '${this.groupType}'})`,
    }, {
      title: this.$translate.instant('hcs.upgradePage.title'),
      state: `hcs.upgradeGroup({customerId: '${this.groupId}'})`,
    });

    this.responseData = [
      {
        uuid: '8e2cf5cb-ca63-4d06-9210-77b5a62ad40b',
        name: 'sm-cucm-c1',
        status: 'Active',
        url: 'http://<base url>/partners/c4bb590c-2b05-4d7a-b796-b94b648b32cb/clusters/8e2cf5cb-ca63-4d06-9210-77b5a62ad40b',
        sftpServer: {
          uuid: '6aeca3ba-b693-4f71-8d5a-7102ce701ea2',
          name: 'sftpserver1',
        },
        hcsNodes: [
          {
            hostName: 'ccm-01',
            typeApplication: 'CUCM',
            isPublisher: false,
            ipAddress: '10.23.34.245',
          }, {
            hostName: 'ccm-c992',
            typeApplication: 'CUCM',
            isPublisher: true,
            ipAddress: '10.23.34.244',
          }, {
            hostName: 'adadse-02',
            typeApplication: 'IM&P',
            isPublisher: true,
            ipAddress: '10.23.34.256',
          }, {
            hostName: 'adsfaj-01',
            typeApplication: 'IM&P',
            isPublisher: false,
            ipAddress: '10.23.34.292',
          },
        ],
      }, {
        uuid: '8e2cf5cb-ca63-4d06-9210-77b5a62ad40c',
        name: 'edlid-uxcn-c2',
        status: 'Needs Software update',
        url: 'http://<base url>/partners/c4bb590c-2b05-4d7a-b796-b94b648b32cb/clusters/8e2cf5cb-ca63-4d06-9210-77b5a62ad40c',
        sftpServer: {
          uuid: '6aeca3ba-b693-4f71-8d5a-7102ce701ea2',
          name: 'sftpserver1',
        },
        hcsNodes: [
          {
            hostName: 'cuxcn-01',
            typeApplication: 'UXCN',
            isPublisher: false,
            ipAddress: '10.23.34.145',
          }, {
            hostName: 'cuxcn-02',
            typeApplication: 'UXCN',
            isPublisher: true,
            ipAddress: '10.23.34.144',
          },
        ],
      },
    ];
    this.clusterList = [];

    if (this.groupType === 'unassigned') {
      //get customer name from api
      this.groupName = 'Unassigned';
      //get cluster list from controller api??
      // this.clusterList = [
      //   {
      //     id: 'a1234',
      //     name: 'un-cucm-f3',
      //     status: 'Nodes need Accepted',
      //     applications: [
      //       {
      //         name: 'CUCM',
      //         count: 2,
      //       }, {
      //         name: 'IM&P',
      //         count: 2,
      //       },
      //     ],
      //   }, {
      //     id: 'x5678',
      //     name: 'asdf-imp-c1',
      //     status: 'Nodes need Accepted',
      //     applications: [
      //       {
      //         name: 'IM&P',
      //         count: 2,
      //       },
      //     ],
      //   }, {
      //     id: 'b1920',
      //     name: 'edlid-uxcn-c2',
      //     status: 'Nodes need Accepted',
      //     applications: [
      //       {
      //         name: 'EXPRC',
      //         count: 2,
      //       },
      //     ],
      //   }, {
      //     id: 'm1212',
      //     name: 'adfve-uxcn-c2',
      //     status: 'Nodes need Accepted',
      //     applications: [
      //       {
      //         name: 'UXCN',
      //         count: 2,
      //       },
      //     ],
      //   }];
    } else {
      //get customer name from api
      this.groupName = 'Betty\'s Flower Shop';
      //get cluster list from upgrade api
      // this.clusterList = [{
      //   id: 'a1234',
      //   name: 'sm-cucm-c1',
      //   status: 'Active',
      //   applications: [
      //     {
      //       name: 'CUCM',
      //       count: 2,
      //     }, {
      //       name: 'IM&P',
      //       count: 2,
      //     },
      //   ],
      // }, {
      //   id: 'x5678',
      //   name: 'sm-imp-c1',
      //   status: 'Active',
      //   applications: [
      //     {
      //       name: 'IM&P',
      //       count: 2,
      //     },
      //   ],
      // }, {
      //   id: 'b1920',
      //   name: 'sm-uxcn-c2',
      //   status: 'Active',
      //   applications: [
      //     {
      //       name: 'EXPRC',
      //       count: 2,
      //     },
      //   ],
      // }, {
      //   id: 'm1212',
      //   name: 'sm-expr-c2',
      //   status: 'Needs Software update',
      //   applications: [
      //     {
      //       name: 'UXCN',
      //       count: 2,
      //     },
      //   ],
      // }];
    }

    this.initClusterList();
  }

  public cardSelected(cluster: IClusterItem): void {
    this.$state.go('hcs.clusterDetail', { groupId: this.groupId, groupType: this.groupType, clusterId: cluster.id, clusterName: cluster.name });
  }

  public closeCard(cluster: IClusterItem, $event: Event): void {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.clusterToBeDeleted = cluster;
    this.$modal.open({
      template: '<hcs-delete-modal delete-fn="$ctrl.deleteFn()" dismiss="$dismiss()" modal-title="$ctrl.title" modal-description="$ctrl.description"></hcs-delete-modal>',
      controller: () => {
        return {
          deleteFn: () => this.deleteCluster(),
          title: this.$translate.instant('hcs.installFiles.deleteModal.title'),
          description: this.$translate.instant('hcs.installFiles.deleteModal.description'),
        };
      },
      modalClass: 'hcs-delete-modal-class',
      controllerAs: '$ctrl',
      type: 'dialog',
    });
  }

  public deleteCluster(): void {
    //delete intsall file && update install file list
  }

  public initClusterList(): void {
    //function to get cluster data from response object
    _.each(this.responseData, (cluster: IHcsClusterSummaryItem) => {
      const applicationList: IApplicationItem[] = [];
      if (!_.isUndefined(cluster.hcsNodes)) {
        _.each(cluster.hcsNodes, (node: INodeSummaryItem) => {
          const index = _.findIndex(applicationList, (application: any) => application.name === node.typeApplication);
          if (index === -1) {
            const applicationItem: IApplicationItem = {
              name: node.typeApplication,
              count: 1,
            };
            applicationList.push(applicationItem);
          } else {
            applicationList[index].count = applicationList[index].count + 1;
          }
        });
      }
      const clusterItem: IClusterItem = {
        id: _.get(cluster, 'uuid'),
        name: _.get(cluster, 'name'),
        status: _.get(cluster, 'status'),
        applications: applicationList,
      };
      this.clusterList.push(clusterItem);
    });
  }
}
