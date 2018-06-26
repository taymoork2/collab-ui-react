import testModule from './index';
describe('Component: upgrade-cluster', () => {
  const CLUSTER_LIST = getJSONFixture('hcs/hcs-inventory/hcs-cluster-list.json');
  const SW_PROFILE_LIST = getJSONFixture('hcs/hcs-upgrade/hcs-sw-profiles-list.json');
  const SW_PROFILE_DETAIL = getJSONFixture('hcs/hcs-upgrade/hcs-sw-profile-detail.json');
  const TEST_CUSTOMER = {
    uuid: '0000',
    name: 'test_customer',
    softwareProfile : SW_PROFILE_LIST[0],
    status : 'SOFTWARE_UPGRADE_NEEDED',
  };

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
    spyOn(this.$modal, 'open').and.returnValue(undefined);
    spyOn(this.HcsControllerService, 'getHcsControllerCustomer').and.returnValue(this.$q.resolve(TEST_CUSTOMER));
    spyOn(this.HcsUpgradeService, 'getHcsUpgradeCustomer').and.returnValue(this.$q.resolve(TEST_CUSTOMER));
    spyOn(this.HcsUpgradeService, 'getSoftwareProfile').and.returnValue(this.$q.resolve(SW_PROFILE_DETAIL));
    spyOn(this.HcsUpgradeService, 'listClusters').and.returnValue(this.$q.resolve(CLUSTER_LIST));
    this.$scope.groupId = TEST_CUSTOMER.uuid;
    this.compileComponent('hcsUpgradeCluster', {
      groupId: 'groupId',
    });
  });

  it('should initialize with expected defaults', function () {
    expect(this.HcsControllerService.getHcsControllerCustomer).toHaveBeenCalledWith(TEST_CUSTOMER.uuid);
    expect(this.controller.groupName).toBe(TEST_CUSTOMER.name);
    expect(this.HcsUpgradeService.getHcsUpgradeCustomer).toHaveBeenCalledWith(TEST_CUSTOMER.uuid);
    expect(this.HcsUpgradeService.getSoftwareProfile).toHaveBeenCalledWith(TEST_CUSTOMER.softwareProfile.uuid);
    expect(this.HcsUpgradeService.listClusters).toHaveBeenCalledWith(TEST_CUSTOMER.uuid);
    expect(this.controller.gridOptions.columnDefs.length).toEqual(6);
    expect(this.controller.gridOptions.data.length).toEqual(2);
  });

  it('should open upgrade modal', function () {
    this.controller.startUpgrade(this.controller.gridOptions.data[0]);
    expect(this.$modal.open).toHaveBeenCalledWith({
      template: `<hcs-upgrade-modal dismiss="$dismiss()" group-id="${this.controller.groupId}" cluster-name="${this.controller.gridOptions.data[0].clusterName}" cluster-uuid="${this.controller.gridOptions.data[0].clusterUuid}" current-version="${this.controller.gridOptions.data[0].currentVersion}" upgrade-to="${this.controller.gridOptions.data[0].upgradeTo}"></hcs-upgrade-modal>`,
      type: 'full',
    });
  });

  it('should open pre check modal', function () {
    this.controller.startPrechecks(this.controller.gridOptions.data[0]);
    expect(this.$modal.open).toHaveBeenCalledWith({
      template: `<hcs-precheck-modal dismiss="$dismiss()" group-id="${this.controller.groupId}" cluster-uuid="${this.controller.gridOptions.data[0].clusterUuid}"></hcs-precheck-modal>`,
      type: 'small',
    });
  });

  it('should change state to upgrade cluster status', function () {
    const $event = {
      stopPropagation: _.noop,
    };
    this.controller.viewUpgradeStatus($event, this.controller.gridOptions.data[0]);
    expect(this.$state.go).toHaveBeenCalled();
  });
});
