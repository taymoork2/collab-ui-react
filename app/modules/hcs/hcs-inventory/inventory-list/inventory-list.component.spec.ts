import testModule from './index';

describe('Component: inventory-list', () => {
  const DETAILS_LINK = 'a';
  const CUSTOMER_LIST = getJSONFixture('hcs/hcs-inventory/hcs-inventory-customer-list.json');

  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$translate',
      'HcsUpgradeService',
      '$q',
      '$timeout',
    );

    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.HcsUpgradeService, 'listClusters').and.returnValue(this.$q.resolve([{
      uuid: '0000',
      name: 'test_cluster',
    }]));
    spyOn(this.HcsUpgradeService, 'listAssignedHcsUpgradeCustomers').and.returnValue(this.$q.resolve(CUSTOMER_LIST));
    this.compileComponent('hcsInventoryList', {});
  });

  it('should initialize with expected defaults', function () {
    expect(this.controller.inventoryListData.length).toEqual(CUSTOMER_LIST.length + 1);
  });

  it('search function should work as expected', function () {
    this.controller.searchInventoryFunction('Shra');
    this.$timeout.flush();
    expect(this.controller.inventoryListData.length).toEqual(1);
    this.controller.searchInventoryFunction('');
    this.$timeout.flush();
    expect(this.controller.inventoryListData.length).toEqual(CUSTOMER_LIST.length + 1);
  });

  it('filter function should work as expected', function () {
    this.controller.filter.selected = [{
      value: 'SOFTWARE_UPGRADE_NEEDED',
      label: 'Software Upgrade Needed',
    }];
    this.controller.searchFilterFunction();
    expect(this.controller.inventoryListData.length).toEqual(2);
  });

  it('should call the onClickSettings method when details is clicked.', function () {
    spyOn(this.controller, 'onClickSettings');
    this.view.find(DETAILS_LINK).click();
    expect(this.controller.onClickSettings).toHaveBeenCalled();
  });
});
