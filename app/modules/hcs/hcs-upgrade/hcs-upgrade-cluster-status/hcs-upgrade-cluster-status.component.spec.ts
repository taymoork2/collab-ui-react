import testModule from './index';

describe('Component: upgrade-cluster-status', () => {
  const CLUSTER_DETAIL = getJSONFixture('hcs/hcs-inventory/hcs-cluster-detail.json');
  const CLUSTER_PRE_CHECK_STATUS = getJSONFixture('hcs/hcs-upgrade/hcs-cluster-precheck-status.json');
  const CLUSTER_TASK_STATUS = getJSONFixture('hcs/hcs-upgrade/hcs-cluster-task_status.json');
  const TEST_CUSTOMER = {
    uuid: '0000',
    name: 'test_customer',
  };
  const NODE_DETAIL_CELL = '.node-detail-column';

  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$translate',
      '$state',
      '$scope',
      '$q',
      'HcsUpgradeService',
      'GridService',
    );

    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.$state, 'go').and.returnValue(undefined);
    spyOn(this.HcsUpgradeService, 'getCluster').and.returnValue(this.$q.resolve(CLUSTER_DETAIL));
    spyOn(this.HcsUpgradeService, 'getPrecheckStatus').and.returnValue(this.$q.resolve(CLUSTER_PRE_CHECK_STATUS));
    spyOn(this.HcsUpgradeService, 'getClusterTasksStatus').and.returnValue(this.$q.resolve(CLUSTER_TASK_STATUS));
    this.$scope.groupId = TEST_CUSTOMER.uuid;
    this.$scope.clusterId = CLUSTER_DETAIL.uuid;
    this.compileComponent('hcsUpgradeClusterStatus', {
      groupId: 'groupId',
      clusterId: 'clusterId',
    });
    spyOn(this.controller, 'selectRow').and.callThrough();
    spyOn(this.controller, 'getNodeStatus').and.callThrough();
    spyOn(this.GridService, 'selectRow').and.returnValue(undefined);
  });

  it('should initialize with expected defaults', function () {
    expect(this.HcsUpgradeService.getCluster).toHaveBeenCalledWith(CLUSTER_DETAIL.uuid);
    expect(this.HcsUpgradeService.getPrecheckStatus).toHaveBeenCalledWith(CLUSTER_DETAIL.uuid);
    expect(this.HcsUpgradeService.getClusterTasksStatus).toHaveBeenCalledWith(CLUSTER_DETAIL.uuid);
    expect(this.controller.gridOptions.columnDefs.length).toEqual(6);
    expect(this.controller.gridOptions.data.length).toEqual(4);
  });

  it('should trigger the state change for side pannel', function () {
    this.view.find(NODE_DETAIL_CELL).click();
    expect(this.controller.selectRow).toHaveBeenCalled();
    expect(this.GridService.selectRow).toHaveBeenCalled();
    expect(this.controller.getNodeStatus).toHaveBeenCalled();
    expect(this.$state.go).toHaveBeenCalled();
  });
});
