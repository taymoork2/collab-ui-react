import testModule from './index';

describe('Component: add-customer-to-cluster', () => {
  const SW_PROFILE_LIST = getJSONFixture('hcs/hcs-upgrade/hcs-sw-profiles-list.json');
  const CANCEL_BUTTON = 'button.btn.btn-default';
  const CLOSE_BUTTON = 'button.close';
  const TEST_CUSTOMER = {
    uuid: '0000',
    name: 'test_customer',
  };
  const SERVICES = ['UPGRADE'];

  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$translate',
      '$scope',
      '$q',
      'HcsUpgradeService',
      'HcsControllerService',
    );
    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.HcsUpgradeService, 'listSoftwareProfiles').and.returnValue(this.$q.resolve({
      softwareProfiles: SW_PROFILE_LIST,
    }));
    spyOn(this.HcsUpgradeService, 'addHcsUpgradeCustomer').and.returnValue(this.$q.resolve(undefined));

    this.$scope.emptyFunction = _.noop;
    this.compileComponent('hcsAddCustomerToCluster', {
      addCustomerToCluster: 'emptyFunction',
      dismiss: 'emptyFunction',
    });
    spyOn(this.controller, 'cancel').and.callThrough();
    spyOn(this.controller, 'dismiss').and.returnValue(undefined);
    spyOn(this.controller, 'addCustomerToCluster').and.returnValue(undefined);
    spyOn(this.HcsControllerService, 'addHcsControllerCustomer').and.returnValue(this.$q.resolve({
      uuid: TEST_CUSTOMER.uuid,
    }));
  });

  it('should initialize with expected defaults', function () {
    expect(this.HcsUpgradeService.listSoftwareProfiles).toHaveBeenCalled();
    expect(this.controller.softwareProfilesList.length).toEqual(SW_PROFILE_LIST.length);
  });

  it('should trigger cancel fucntion on cancel button click', function () {
    this.view.find(CANCEL_BUTTON).click();
    expect(this.controller.cancel).toHaveBeenCalled();
    expect(this.controller.dismiss).toHaveBeenCalled();
  });

  it('should trigger cancel fucntion on close button click', function () {
    this.view.find(CLOSE_BUTTON).click();
    expect(this.controller.cancel).toHaveBeenCalled();
    expect(this.controller.dismiss).toHaveBeenCalled();
  });

  it('should be able to save the customer', function () {
    this.controller.customerName = TEST_CUSTOMER.name;
    this.controller.softwareProfileSelected = { label: SW_PROFILE_LIST[0].name, value: SW_PROFILE_LIST[0].uuid };
    this.controller.save();
    this.$scope.$apply();
    expect(this.HcsControllerService.addHcsControllerCustomer).toHaveBeenCalledWith(TEST_CUSTOMER.name, SERVICES);
    expect(this.HcsUpgradeService.addHcsUpgradeCustomer).toHaveBeenCalled();
    expect(this.controller.addCustomerToCluster).toHaveBeenCalled();
    expect(this.controller.dismiss).toHaveBeenCalled();
  });
});
