import testModule from './index';
import { WebexSiteManagementController } from './webexSiteManagementSetting.controller';

describe('Controller: WebexSiteManagementController', function () {
  let orgData;

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
    spyOn(this.Orgservice, 'getOrg').and.callFake((callback) => {
      callback(orgData, 200);
    });

    // Init orgData
    orgData = {
      success: true,
      orgSettings: {},
    };
  });

  function initController(): void {
    this.initController(WebexSiteManagementController, {});
  }

  describe('init', function () {
    const params = {
      basicInfo: true,
    };
    it('should get the org service and read the settings correctly', function () {
      orgData.orgSettings.allowSiteManagementByCustomer = false;
      initController.apply(this);
      expect(this.Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), 'ABC123', params);
      expect(this.controller.allowSiteManagementByCustomer).toBe(false);
    });
    it('should get set the flag to default true if the setting is not initialized', function () {
      initController.apply(this);
      expect(this.Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), 'ABC123', params);
      expect(this.controller.allowSiteManagementByCustomer).toBe(true);
    });
  });
  describe('updating the webex site management setting', function ()  {
    beforeEach(function () {
      initController.apply(this);
    });
    it('should update the flag to false if the box is unchecked', function () {
      this.controller.allowSiteManagementByCustomer = false;
      this.$scope.$digest();
      expect(this.Orgservice.setOrgSettings).toHaveBeenCalledWith('ABC123', { allowSiteManagementByCustomer: false });
      expect(this.controller.allowSiteManagementByCustomer).toBe(false);
      expect(this.Notification.success).toHaveBeenCalled();
    });
  });
});
