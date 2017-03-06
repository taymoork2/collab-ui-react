/// <reference path="settings.controller.ts"/>
describe('SettingsCtrl', function () {

  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies('$rootScope', '$scope', '$stateParams', '$controller', '$q', '$timeout', 'Authinfo', 'FeatureToggleService', 'Orgservice');

    spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.reject());
    spyOn(this.Authinfo, 'isPartner').and.returnValue(false);
    spyOn(this.Authinfo, 'isCustomerAdmin').and.returnValue(false);
    spyOn(this.Authinfo, 'isDirectCustomer').and.returnValue(false);

    spyOn(this.FeatureToggleService, 'atlasDataRetentionSettingsGetStatus').and.returnValue(this.$q.when(true));
    spyOn(this.FeatureToggleService, 'atlasPinSettingsGetStatus').and.returnValue(this.$q.when(true));
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
      expect(this.controller.branding).toBeTruthy();
      expect(this.controller.support).toBeTruthy();

      // these do not exist for Partner admins
      expect(this.controller.security).toBeFalsy();
      expect(this.controller.authentication).toBeFalsy();
      expect(this.controller.domains).toBeFalsy();
      expect(this.controller.privacy).toBeFalsy();
      expect(this.controller.sipDomain).toBeFalsy();
      expect(this.controller.dirsync).toBeFalsy();
      expect(this.controller.retention).toBeFalsy();
    });
  });

  describe('for direct customer', function () {
    beforeEach(function () {
      this.Authinfo.isDirectCustomer.and.returnValue(true);
      initController.apply(this);
    });

    it('should create the ctrl and add the direct customer setting sections', function () {
      expect(this.controller.branding).toBeTruthy();
      expect(this.controller.support).toBeTruthy();

      // these should exist for non-Partner admin
      expect(this.controller.security).toBeTruthy();
      expect(this.controller.authentication).toBeTruthy();
      expect(this.controller.domains).toBeTruthy();
      expect(this.controller.privacy).toBeTruthy();
      expect(this.controller.sipDomain).toBeTruthy();
      expect(this.controller.dirsync).toBeTruthy();
      expect(this.controller.retention).toBeTruthy();
    });
  });

  describe('for normal admin', function () {
    beforeEach(function () {
      this.Authinfo.isPartner.and.returnValue(false);
      this.Authinfo.isCustomerAdmin.and.returnValue(true);
    });

    describe('with allowCustomerLogos set to true', function () {
      beforeEach(function () {
        this.Orgservice.getOrg.and.returnValue(this.$q.resolve({
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
        expect(this.controller.support).toBeTruthy();
        expect(this.controller.branding).toBeTruthy();
        expect(this.controller.privacy).toBeTruthy();
        expect(this.controller.retention).toBeTruthy();
      });
    });

    describe('with allowCustomerLogos set to false', function () {
      beforeEach(function () {
        this.Orgservice.getOrg.and.returnValue(this.$q.resolve({
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
        expect(this.controller.support).toBeTruthy();
        expect(this.controller.branding).toBeFalsy();
        expect(this.controller.privacy).toBeTruthy();
        expect(this.controller.retention).toBeTruthy();
      });
    });
  });

  describe('with save\cancel buttons', function () {
    let ACTIVATE_SAVE_BUTTONS: string = 'settings-control-activate-footer';
    let REMOVE_SAVE_BUTTONS: string = 'settings-control-remove-footer';
    let SAVE_BROADCAST: string = 'settings-control-save';
    let CANCEL_BROADCAST: string = 'settings-control-cancel';

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
