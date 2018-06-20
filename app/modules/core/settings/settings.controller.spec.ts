import testModule from './index';

describe('SettingsCtrl', function () {

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$rootScope', '$scope', '$stateParams', '$controller', '$q', '$timeout', 'Authinfo', 'FeatureToggleService', 'ProPackService', 'Orgservice');

    spyOn(this.Authinfo, 'isPartner').and.returnValue(false);
    spyOn(this.Authinfo, 'isCustomerAdmin').and.returnValue(false);
    spyOn(this.Authinfo, 'isDirectCustomer').and.returnValue(false);
    spyOn(this.Authinfo, 'isEnterpriseCustomer').and.returnValue(false);

    spyOn(this.FeatureToggleService, 'atlasDataRetentionSettingsGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'csdmDeviceBrandingGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasBlockExternalCommunicationSettingsGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasEmailSuppressGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasIntegrationsManagementGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.ProPackService, 'hasProPackPurchasedOrNotEnabled');
  });

  function initController(injectors) {
    this.controller = this.$controller('SettingsCtrl', _.merge({
      $scope: this.$scope,
    }, injectors));
    this.$scope.$apply();
    spyOn(this.controller, 'scrollIntoView').and.callFake(_.noop);
    this.controller.$onInit();
    this.$scope.$apply();
  }

  ////////////////////////

  describe('for partner admin', function () {
    beforeEach(function () {
      this.Authinfo.isPartner.and.returnValue(true);
      initController.apply(this);
    });

    it('should create the ctrl and add the partner setting sections', function () {
      expect(this.controller.support).toBeTruthy();

      // these do not exist for Partner admins
      expect(this.controller.brandingWrapper).toBeTruthy(); //wrapper until toggle is removed
      expect(this.controller.security).toBeFalsy();
      expect(this.controller.authentication).toBeFalsy();
      expect(this.controller.email).toBeFalsy();
      expect(this.controller.domains).toBeFalsy();
      expect(this.controller.privacy).toBeFalsy();
      expect(this.controller.sipDomain).toBeFalsy();
      expect(this.controller.dirsync).toBeFalsy();
      expect(this.controller.retention).toBeFalsy();
      expect(this.controller.externalCommunication).toBeFalsy();
    });
  });

  describe('for direct customer', function () {
    beforeEach(function () {
      this.Authinfo.isEnterpriseCustomer.and.returnValue(true);
      this.Authinfo.isDirectCustomer.and.returnValue(true);
      initController.apply(this);
    });

    it('should create the ctrl and add the direct customer setting sections', function () {
      expect(this.controller.brandingWrapper).toBeTruthy(); //wrapper until toggle is removed
      expect(this.controller.support).toBeTruthy();

      // these should exist for non-Partner admin
      expect(this.controller.security).toBeTruthy();
      expect(this.controller.authentication).toBeTruthy();
      expect(this.controller.email).toBeTruthy();
      expect(this.controller.domains).toBeTruthy();
      expect(this.controller.privacy).toBeTruthy();
      expect(this.controller.sipDomain).toBeTruthy();
      expect(this.controller.dirsync).toBeTruthy();
      expect(this.controller.retention).toBeTruthy();
      expect(this.controller.externalCommunication).toBeTruthy();
    });
  });

  describe('for normal admin', function () {
    beforeEach(function () {
      this.Authinfo.isPartner.and.returnValue(false);
      this.Authinfo.isCustomerAdmin.and.returnValue(true);
      this.Authinfo.isEnterpriseCustomer.and.returnValue(true);
    });

    describe('with allowCustomerLogos set to true', function () {
      beforeEach(function () {
        spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({
          data: {
            orgSettings: {
              allowCustomerLogos: true,
            },
          },
        }));
        initController.apply(this);
      });

      it('should create the ctrl and add the normal setting sections', function () {
        expect(this.controller.security).toBeTruthy();
        expect(this.controller.domains).toBeTruthy();
        expect(this.controller.sipDomain).toBeTruthy();
        expect(this.controller.authentication).toBeTruthy();
        expect(this.controller.email).toBeTruthy();
        expect(this.controller.support).toBeTruthy();
        expect(this.controller.brandingWrapper).toBeTruthy(); //wrapper until toggle is removed
        expect(this.controller.privacy).toBeTruthy();
        expect(this.controller.retention).toBeTruthy();
        expect(this.controller.integrations).toBeTruthy();
        expect(this.controller.externalCommunication).toBeTruthy();
      });
    });

    describe('with allowCustomerLogos set to false', function () {
      beforeEach(function () {
        spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({
          data: {
            orgSettings: {
              allowCustomerLogos: false,
            },
          },
        }));
        initController.apply(this);
      });

      it('should create the ctrl and add the normal setting sections', function () {
        expect(this.controller.security).toBeTruthy();
        expect(this.controller.domains).toBeTruthy();
        expect(this.controller.sipDomain).toBeTruthy();
        expect(this.controller.authentication).toBeTruthy();
        expect(this.controller.email).toBeTruthy();
        expect(this.controller.support).toBeTruthy();
        expect(this.controller.branding).toBeFalsy();
        expect(this.controller.privacy).toBeTruthy();
        expect(this.controller.retention).toBeTruthy();
        expect(this.controller.externalCommunication).toBeTruthy();
      });
    });
  });

  describe('integrations section', function() {
    function setIntegrationsToggleAndRole(ftValue, adminValue) {
      this.FeatureToggleService.atlasIntegrationsManagementGetStatus.and.returnValue(this.$q.resolve(ftValue));
      this.Authinfo.isCustomerAdmin.and.returnValue(adminValue);
      initController.apply(this);
    }
    it('should not show integrations for  user who is not a full admin', function() {
      setIntegrationsToggleAndRole.apply(this, [true, false]);
      expect(this.controller.integrations).toBeUndefined();
    });
    it('should not show integrations if integrations FT is not set', function() {
      setIntegrationsToggleAndRole.apply(this, [false, true]);
      expect(this.controller.integrations).toBeUndefined();
    });
    it('should how integrations if integrations FT is set and user is full amdin', function() {
      setIntegrationsToggleAndRole.apply(this, [true, true]);
      expect(this.controller.integrations).toBeDefined();
    });
  });

  describe('with save\cancel buttons', function () {
    const ACTIVATE_SAVE_BUTTONS: string = 'settings-control-activate-footer';
    const REMOVE_SAVE_BUTTONS: string = 'settings-control-remove-footer';
    const SAVE_BROADCAST: string = 'settings-control-save';
    const CANCEL_BROADCAST: string = 'settings-control-cancel';

    beforeEach(function () {
      spyOn(this.$scope, '$emit').and.callThrough();
      initController.apply(this);
    });

    it('should set the save function on broadcast and then reset to defaults after save()', function () {
      this.$rootScope.$broadcast(ACTIVATE_SAVE_BUTTONS);
      expect(this.controller.saveCancelFooter).toBeTruthy();

      this.controller.save();
      expect(this.$scope.$emit).toHaveBeenCalledTimes(1);
      expect(this.$scope.$emit).toHaveBeenCalledWith(SAVE_BROADCAST);
      expect(this.controller.saveCancelFooter).toBeFalsy();
    });

    it('should set the cancel function on broadcast and then reset to defaults after cancel()', function () {
      this.$rootScope.$broadcast(ACTIVATE_SAVE_BUTTONS);
      expect(this.controller.saveCancelFooter).toBeTruthy();

      this.controller.cancel();
      expect(this.$scope.$emit).toHaveBeenCalledTimes(1);
      expect(this.$scope.$emit).toHaveBeenCalledWith(CANCEL_BROADCAST);
      expect(this.controller.saveCancelFooter).toBeFalsy();
    });

    it('should remove save\cancel buttons on REMOVE_SAVE_BUTTONS broadcast', function () {
      this.controller.saveCancelFooter = true;
      this.$rootScope.$broadcast(REMOVE_SAVE_BUTTONS);
      expect(this.controller.saveCancelFooter).toBeFalsy();
    });
  });

  describe('with showSettings stateParam', function () {

    it('should not call scrollIntoView when no showSettigs param supplied', function() {
      initController.apply(this);
      expect(this.controller.scrollIntoView).not.toHaveBeenCalled();
    });

    it('should call scrollIntoView with the requested section name', function() {
      initController.apply(this, [{
        $stateParams: { showSettings: 'privacy' },
      }]);
      this.$timeout.flush();
      expect(this.controller.scrollIntoView).toHaveBeenCalledWith('privacy');
    });

  });
});
