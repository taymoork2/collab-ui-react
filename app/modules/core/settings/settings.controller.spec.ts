/// <reference path="settings.controller.ts"/>
describe('SettingsCtrl', function () {
  let controller, initController;

  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies('$rootScope', '$scope', '$controller', '$q', 'Authinfo', 'FeatureToggleService', 'Orgservice');

    spyOn(this.Orgservice, 'getOrg');
    spyOn(this.FeatureToggleService, 'atlasDataRetentionSettingsGetStatus');
    spyOn(this.FeatureToggleService, 'atlasPinSettingsGetStatus');
    spyOn(this.Authinfo, 'isPartner');
    spyOn(this.Authinfo, 'isCustomerAdmin');
    spyOn(this.Authinfo, 'isDirectCustomer');

    this.FeatureToggleService.atlasPinSettingsGetStatus.and.returnValue(this.$q.when(true));
    this.FeatureToggleService.atlasDataRetentionSettingsGetStatus.and.returnValue(this.$q.when(true));

    initController = () => {
      controller = this.$controller('SettingsCtrl', {
        $scope: this.$scope,
        hasFeatureToggle: true,
      });

      this.$scope.$apply();
    };
  });

  describe('for partner admin', function () {
    beforeEach(function () {
      this.Authinfo.isPartner.and.returnValue(true);
      initController();
    });

    it('should create the ctrl and add the partner setting sections', function () {
      expect(controller.security).toBeFalsy();
      expect(controller.domains).toBeFalsy();
      expect(controller.sipDomain).toBeFalsy();
      expect(controller.authentication).toBeFalsy();
      expect(controller.support).toBeTruthy();
      expect(controller.branding).toBeTruthy();
      expect(controller.privacy).toBeFalsy();
      expect(controller.retention).toBeFalsy();
    });
  });

  describe('for direct customer', function () {
    beforeEach(function () {
      this.Authinfo.isDirectCustomer.and.returnValue(true);
      initController();
    });

    it('should create the ctrl and add the direct customer setting sections', function () {
      expect(controller.security).toBeTruthy();
      expect(controller.domains).toBeTruthy();
      expect(controller.sipDomain).toBeTruthy();
      expect(controller.authentication).toBeTruthy();
      expect(controller.support).toBeTruthy();
      expect(controller.branding).toBeTruthy();
      expect(controller.privacy).toBeTruthy();
      expect(controller.retention).toBeTruthy();
    });
  });

  describe('for normal admin', function () {
    beforeEach(function () {
      this.Authinfo.isPartner.and.returnValue(false);
      this.Authinfo.isCustomerAdmin.and.returnValue(true);
    });

    describe('with allowCustomerLogos set to true', function () {
      beforeEach(function () {
        this.Orgservice.getOrg.and.returnValue(this.$q.when({
          data: {
            orgSettings: {
              allowCustomerLogos: true,
            },
          },
        }));
        initController();
      });

      it('should create the ctrl and add the normal setting sections', function () {
        expect(controller.security).toBeTruthy();
        expect(controller.domains).toBeTruthy();
        expect(controller.sipDomain).toBeTruthy();
        expect(controller.authentication).toBeTruthy();
        expect(controller.support).toBeTruthy();
        expect(controller.branding).toBeTruthy();
        expect(controller.privacy).toBeTruthy();
        expect(controller.retention).toBeTruthy();
      });
    });

    describe('with allowCustomerLogos set to false', function () {
      beforeEach(function () {
        this.Orgservice.getOrg.and.returnValue(this.$q.when({
          data: {
            orgSettings: {
              allowCustomerLogos: false,
            },
          },
        }));
        initController();
      });

      it('should create the ctrl and add the normal setting sections', function () {
        expect(controller.security).toBeTruthy();
        expect(controller.domains).toBeTruthy();
        expect(controller.sipDomain).toBeTruthy();
        expect(controller.authentication).toBeTruthy();
        expect(controller.support).toBeTruthy();
        expect(controller.branding).toBeFalsy();
        expect(controller.privacy).toBeTruthy();
        expect(controller.retention).toBeTruthy();
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
      initController();
    });

    it('should set the save function on broadcast and then reset to defaults after save()', function () {
      this.$rootScope.$broadcast(ACTIVATE_SAVE_BUTTONS);
      expect(controller.saveCancelFooter).toBeTruthy();

      controller.save();
      expect(this.$scope.$emit).toHaveBeenCalledTimes(1);
      expect(this.$scope.$emit).toHaveBeenCalledWith(SAVE_BROADCAST);
      expect(controller.saveCancelFooter).toBeFalsy();
    });

    it('should set the cancel function on broadcast and then reset to defaults after cancel()', function () {
      this.$rootScope.$broadcast(ACTIVATE_SAVE_BUTTONS);
      expect(controller.saveCancelFooter).toBeTruthy();

      controller.cancel();
      expect(this.$scope.$emit).toHaveBeenCalledTimes(1);
      expect(this.$scope.$emit).toHaveBeenCalledWith(CANCEL_BROADCAST);
      expect(controller.saveCancelFooter).toBeFalsy();
    });

    it('should remove save\cancel buttons on REMOVE_SAVE_BUTTONS broadcast', function () {
      controller.saveCancelFooter = true;
      this.$rootScope.$broadcast(REMOVE_SAVE_BUTTONS);
      expect(controller.saveCancelFooter).toBeFalsy();
    });
  });
});
