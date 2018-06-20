import testModule from './index';
import { IHcsNode } from 'modules/hcs/hcs-shared/hcs-upgrade';
import { HcsModalTypeSelect } from './cluster-detail.component';

describe('Component: cluster-detail', () => {
  const CLUSTER_DETAIL = getJSONFixture('hcs/hcs-inventory/hcs-cluster-detail.json');
  const CUSTOMERS_LIST = getJSONFixture('hcs/hcs-inventory/hcs-customers-list.json');
  const SFTP_SERVER_LIST = getJSONFixture('hcs/hcs-upgrade/hcs-sftp-servers-list.json');
  const TEST_CUSTOMER = {
    uuid: '0000',
    name: 'test_customer',
  };
  const SAVE_BUTTON = 'button.btn.btn--primary';

  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$translate',
      '$modal',
      '$state',
      '$scope',
      '$timeout',
      '$q',
      'HcsUpgradeService',
      'HcsControllerService',
    );

    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.$state, 'go').and.returnValue(undefined);
    spyOn(this.$modal, 'open').and.returnValue(undefined);
    spyOn(this.HcsControllerService, 'getHcsControllerCustomer').and.returnValue(this.$q.resolve(TEST_CUSTOMER));
    spyOn(this.HcsControllerService, 'listHcsCustomers').and.returnValue(this.$q.resolve(CUSTOMERS_LIST));
    spyOn(this.HcsUpgradeService, 'listSftpServers').and.returnValue(this.$q.resolve(SFTP_SERVER_LIST));
    spyOn(this.HcsUpgradeService, 'getCluster').and.returnValue(this.$q.resolve(CLUSTER_DETAIL));
    spyOn(this.HcsUpgradeService, 'updateCluster').and.returnValue(this.$q.resolve(null));
    spyOn(this.HcsControllerService, 'acceptAgent').and.returnValue(this.$q.resolve(null));
    spyOn(this.HcsControllerService, 'rejectAgent').and.returnValue(this.$q.resolve(null));
  });
  describe('Unassigned Cluster', function() {
    beforeEach(function () {
      this.$scope.groupId = 'unassigned';
      this.$scope.clusterId = CLUSTER_DETAIL.uuid;
      this.compileComponent('hcsClusterDetail', {
        groupId: 'groupId',
        clusterId: 'clusterId',
      });
      spyOn(this.controller, 'addCustomerModal').and.callThrough();
      spyOn(this.controller, 'openEditModal').and.callThrough();
      spyOn(this.controller, 'saveClusterDetailChanges').and.callThrough();
    });
    it('should initialize with expected defaults', function () {
      expect(this.controller.customerSelected.value).toEqual('');
      expect(this.HcsControllerService.getHcsControllerCustomer).not.toHaveBeenCalled();
      expect(this.HcsUpgradeService.getCluster).toHaveBeenCalledWith(CLUSTER_DETAIL.uuid);
    });

    it('should be able to accept nodes', function() {
      this.controller.acceptNode(this.controller.clusterDetail.nodes[0]);
      const nodes: IHcsNode[] = this.controller.clusterDetail.nodes;
      expect(_.find(nodes, { uuid: this.controller.clusterDetail.nodes[0].uuid }).isAccepted).toBeTruthy();
    });

    it('should be able to Reject nodes', function() {
      this.controller.rejectNode(this.controller.clusterDetail.nodes[0]);
      const nodes: IHcsNode[] = this.controller.clusterDetail.nodes;
      expect(_.find(nodes, { uuid: this.controller.clusterDetail.nodes[0].uuid }).isRejected).toBeTruthy();
    });

    it('should be able to search customers', function() {
      this.controller.onCustomerSearch('test_c');
      this.$timeout.flush();
      expect(this.controller.customerSelectOptions.length).toEqual(2);
      //add customer needs to appear even when search results dont match
      this.controller.onCustomerSearch('sssss');
      this.$timeout.flush();
      expect(this.controller.customerSelectOptions.length).toEqual(1);
      this.controller.onCustomerSearch('');
      this.$timeout.flush();
      expect(this.controller.customerSelectOptions.length).toEqual(CUSTOMERS_LIST.length + 1);
    });

    it('should open add customer modal on selecting add customer', function() {
      this.controller.customerSelected = { label: 'Add Customer', value: 'addCustomer' };
      this.controller.onCustomerChanged();
      expect(this.controller.addCustomerModal).toHaveBeenCalled();
      expect(this.controller.openEditModal).toHaveBeenCalledWith(HcsModalTypeSelect.addCustomer);
      expect(this.$modal.open).toHaveBeenCalled();
    });

    it('should be able to save and update customer information', function() {
      this.controller.clusterName = 'New Cluster Name';
      this.controller.acceptNode(this.controller.clusterDetail.nodes[0]);
      this.controller.rejectNode(this.controller.clusterDetail.nodes[1]);
      this.view.find(SAVE_BUTTON).click();
      expect(this.controller.saveClusterDetailChanges).toHaveBeenCalled();
      expect(this.HcsControllerService.acceptAgent).toHaveBeenCalledTimes(1);
      expect(this.HcsControllerService.rejectAgent).toHaveBeenCalledTimes(1);
      expect(this.$state.go).toHaveBeenCalled();
    });
  });

  describe('Assigned Cluster', function() {
    beforeEach(function () {
      this.$scope.groupId = TEST_CUSTOMER.uuid;
      this.$scope.clusterId = CLUSTER_DETAIL.uuid;
      this.compileComponent('hcsClusterDetail', {
        groupId: 'groupId',
        clusterId: 'clusterId',
      });
      spyOn(this.controller, 'openEditModal').and.callThrough();
    });
    it('should initialize with expected defaults', function () {
      expect(this.controller.customerSelected.value).toEqual(TEST_CUSTOMER.uuid);
      expect(this.HcsControllerService.getHcsControllerCustomer).toHaveBeenCalledWith(TEST_CUSTOMER.uuid);
      expect(this.HcsControllerService.listHcsCustomers).toHaveBeenCalled();
      // +1 because add customer option is added to select
      expect(this.controller.customerSelectOptions.length).toEqual(CUSTOMERS_LIST.length + 1);
      expect(this.HcsUpgradeService.listSftpServers).toHaveBeenCalled();
      expect(this.controller.sftpServersList.length).toEqual(SFTP_SERVER_LIST.sftpServers.length);
      expect(this.HcsUpgradeService.getCluster).toHaveBeenCalledWith(CLUSTER_DETAIL.uuid);
      expect(this.controller.clusterName).toEqual(CLUSTER_DETAIL.name);
    });
    it('should open edit sftp server for node when selected', function() {
      this.controller.editNodeSftp(this.controller.clusterDetail.nodes[0]);
      expect(this.controller.openEditModal).toHaveBeenCalledWith(HcsModalTypeSelect.editSftp, this.controller.clusterDetail.nodes[0]);
      expect(this.$modal.open).toHaveBeenCalled();
    });
  });
});
