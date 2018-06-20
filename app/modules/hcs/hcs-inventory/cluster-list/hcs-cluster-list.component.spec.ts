import testModule from './index';

describe('Component: cluster-list', () => {
  const CLUSTER_LIST = getJSONFixture('hcs/hcs-inventory/hcs-cluster-list.json');
  const SW_PROFILE_LIST = getJSONFixture('hcs/hcs-sw-profiles/hcs-sw-profiles-list.json');
  const TEST_CUSTOMER = {
    uuid: '0000',
    name: 'test_customer',
  };
  const CLUSTER_CARD = 'article';
  const DELETE_BUTTON = 'button.close';

  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$translate',
      '$modal',
      '$state',
      '$scope',
      '$q',
      'HcsUpgradeService',
      'HcsControllerService',
    );

    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.$state, 'go').and.returnValue(undefined);
    spyOn(this.$modal, 'open').and.callThrough();
    spyOn(this.HcsControllerService, 'getHcsControllerCustomer').and.returnValue(this.$q.resolve(TEST_CUSTOMER));
    spyOn(this.HcsUpgradeService, 'listClusters').and.returnValue(this.$q.resolve(CLUSTER_LIST));
  });
  describe('Unassigned Cluster list', function() {
    beforeEach(function () {
      this.$scope.clusterId = 'unassigned';
      this.compileComponent('hcsClusterList', {
        groupId: 'clusterId',
      });
      spyOn(this.HcsUpgradeService, 'deleteCluster').and.returnValue(this.$q.resolve(undefined));
    });

    it('should initialize with expected defaults', function () {
      expect(this.controller.tabs.length).toEqual(0);
      expect(this.controller.groupName).toBe('Unassigned');
      expect(this.HcsControllerService.getHcsControllerCustomer).not.toHaveBeenCalled();
      expect(this.HcsUpgradeService.listClusters).toHaveBeenCalled();
      expect(this.controller.clusterList.length).toEqual(CLUSTER_LIST.length);
    });

    it('select a cluster card should trigger state change', function() {
      this.view.find(CLUSTER_CARD).click();
      expect(this.$state.go).toHaveBeenCalled();
    });

    it('delete a cluster should open delete modal', function() {
      this.view.find(DELETE_BUTTON).click();
      expect(this.$modal.open).toHaveBeenCalled();
    });

    it('delete function makes delete call', function() {
      this.controller.deleteCluster(CLUSTER_LIST[0].uuid);
      expect(this.HcsUpgradeService.deleteCluster).toHaveBeenCalledWith(CLUSTER_LIST[0].uuid);
    });
  });

  describe('Assigned Cluster list', function() {
    beforeEach(function () {
      this.$scope.clusterId = TEST_CUSTOMER.uuid;
      spyOn(this.HcsUpgradeService, 'listSoftwareProfiles').and.returnValue(this.$q.resolve({
        softwareProfiles: SW_PROFILE_LIST,
      }));
      spyOn(this.HcsUpgradeService, 'getHcsUpgradeCustomer').and.returnValue(this.$q.resolve({
        uuid: TEST_CUSTOMER.uuid,
        softwareProfile: SW_PROFILE_LIST[0],
      }));
      this.compileComponent('hcsClusterList', {
        groupId: 'clusterId',
      });
      spyOn(this.HcsUpgradeService, 'updateHcsUpgradeCustomerSwProfile').and.returnValue(this.$q.resolve(undefined));
    });

    it('should initialize with expected defaults', function () {
      expect(this.controller.tabs.length).toEqual(2);
      expect(this.HcsControllerService.getHcsControllerCustomer).toHaveBeenCalledWith(TEST_CUSTOMER.uuid);
      expect(this.HcsUpgradeService.listSoftwareProfiles).toHaveBeenCalled();
      expect(this.controller.groupName).toBe('test_customer');
      expect(this.HcsUpgradeService.listClusters).toHaveBeenCalled();
      expect(this.controller.softwareVersionProfiles.length).toEqual(2);
      expect(this.HcsUpgradeService.getHcsUpgradeCustomer).toHaveBeenCalledWith(TEST_CUSTOMER.uuid);
      expect(this.controller.softwareVersionSelected).not.toBeEmpty();
      expect(this.HcsUpgradeService.listClusters).toHaveBeenCalled();
      expect(this.controller.clusterList.length).toEqual(CLUSTER_LIST.length);
    });

    it('sw version change should update customer', function() {
      this.controller.onSoftwareVersionChanged();
      expect(this.HcsUpgradeService.updateHcsUpgradeCustomerSwProfile).toHaveBeenCalledWith(TEST_CUSTOMER.uuid, SW_PROFILE_LIST[0]);
    });
  });

  describe('Assigned Cluster list with no sw profiles', function() {
    beforeEach(function () {
      this.$scope.clusterId = TEST_CUSTOMER.uuid;
      spyOn(this.HcsUpgradeService, 'listSoftwareProfiles').and.returnValue(this.$q.resolve({
        softwareProfiles: [],
      }));
      spyOn(this.HcsUpgradeService, 'getHcsUpgradeCustomer').and.returnValue(this.$q.resolve({
        uuid: undefined,
        softwareProfile: undefined,
      }));
      this.compileComponent('hcsClusterList', {
        groupId: 'clusterId',
      });
      spyOn(this.HcsUpgradeService, 'updateHcsUpgradeCustomerSwProfile').and.returnValue(this.$q.resolve(undefined));
    });

    it('should have disable sw profile enabled', function() {
      expect(this.controller.disableSwProfileSelect).toBeTruthy();
    });
  });
});
