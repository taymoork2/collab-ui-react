import testModule from './index';
import { WebexSiteManagementController } from './webexSiteManagementSetting.controller';

describe('Controller: WebexSiteManagementController', function () {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$controller',
      '$q',
      '$rootScope',
      '$scope',
      'Authinfo',
      'Notification',
      'Orgservice',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('ABC123');
    spyOn(this.Orgservice, 'setOrgSettings').and.returnValue(this.$q.resolve());
    spyOn(this.Notification, 'success');
    spyOn(this.Orgservice, 'getAllowCustomerSiteManagementSetting').and.returnValue(this.$q.resolve({ allowCustomerSiteManagementSetting: true }));
    spyOn(this.Orgservice, 'setAllowCustomerSiteManagementSetting').and.returnValue(this.$q.resolve());
  });

  function initController(): void {
    this.initController(WebexSiteManagementController, {});
  }

  describe('upon controller initialization', function () {
    it('should get the allowCustomerSiteManagment setting correctly from API call hitting backend orgSettings controller', function () {
      // Test to check the default value is 'false'
      // expect(this.controller.allowSiteManagementByCustomer).toBe(false);
      // Initialize the controller and then expect the get call to return and set the actual value from the API
      initController.apply(this);
      expect(this.Orgservice.getAllowCustomerSiteManagementSetting).toHaveBeenCalled();
      expect(this.controller.allowSiteManagementByCustomer).toBe(true);
    });
  });

  describe('should be able to update the allowCustomerSiteManagementSetting', function ()  {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should update the flag to true if the box is checked', function () {
      this.controller.allowSiteManagementByCustomer = true;
      this.$scope.$digest();
      expect(this.Orgservice.setAllowCustomerSiteManagementSetting).toHaveBeenCalledWith('ABC123', { allowSiteManagementByCustomer: true });
      expect(this.controller.allowSiteManagementByCustomer).toBe(true);
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should update the flag to false if the box is unchecked', function () {
      this.controller.allowSiteManagementByCustomer = false;
      this.$scope.$digest();
      expect(this.Orgservice.setAllowCustomerSiteManagementSetting).toHaveBeenCalledWith('ABC123', { allowSiteManagementByCustomer: false });
      expect(this.controller.allowSiteManagementByCustomer).toBe(false);
      expect(this.Notification.success).toHaveBeenCalled();
    });
  });
});
