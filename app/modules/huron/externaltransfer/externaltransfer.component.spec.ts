import externalServiceModule from './index';

describe('Component: externaltransferUser', () => {

  beforeEach(function () {
    this.orgSettingResponseOn = {
      allowExternalTransfer: 'On',
      uuid: 'e3cc6b07-59b6-40d2-8d9e-06986c45a99d',
    };

    this.orgSettingResponseOff = {
      allowExternalTransfer: 'Off',
      uuid: 'e3cc6b07-59b6-40d2-8d9e-06986c45a99d',
    };

    this.userSettingResponseOn = {
      firstName: 'Ollie',
      allowExternalTransfer: true,
    };

    this.userSettingResponseOff = {
      firstName: 'Ollie',
      allowExternalTransfer: false,
    };

    this.userSettingResponseDefault = {
      firstName: 'Ollie',
      allowExternalTransfer: null,
    };
  });

  beforeEach(function () {
    this.initModules(externalServiceModule);
    this.injectDependencies(
      '$scope',
      '$q',
      'HuronSiteService',
      'Authinfo',
      'ExternalTransferService',
      '$translate',
      'Notification',
    );

    this.getOrgSettings = this.$q.defer();
    this.getUserSettings = this.$q.defer();
    this.saveExternalTransferDefer = this.$q.defer();
    spyOn(this.HuronSiteService, 'getSite').and.returnValue(this.getOrgSettings.promise);
    spyOn(this.ExternalTransferService, 'getDefaultSetting').and.returnValue(this.getUserSettings.promise);
    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.ExternalTransferService, 'updateSettings').and.returnValue(this.saveExternalTransferDefer.promise);
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorWithTrackingId');
  });

  function initComponent() {
    this.compileComponent('ucExternalTransfer', {
      memberType: 'memberType',
      memberId: 'memberId',
    });
    this.$scope.$apply();
  }

  describe('onInit', () => {
    const options = {
      on: 'common.on',
      off: 'common.off',
      alwaysAllow: 'serviceSetupModal.externalTransfer.alwaysAllow',
      neverAllow: 'serviceSetupModal.externalTransfer.neverAllow',
      defaultOrgSetting: 'serviceSetupModal.externalTransfer.orgSetting', //Organization Settings (On)',
      ITransferOptions: [{
        label: 'serviceSetupModal.externalTransfer.orgSetting',
        value: null,
      }, {
        label: 'serviceSetupModal.externalTransfer.alwaysAllow',
        value: true,
      }, {
        label: 'serviceSetupModal.externalTransfer.neverAllow',
        value: false,
      }],
    };

    beforeEach(initComponent);
    it('should load settings when user settings is On', function () {
      this.getOrgSettings.resolve(this.orgSettingResponseOn);
      this.getUserSettings.resolve(this.userSettingResponseOn['allowExternalTransfer']);
      this.controller.on = true;
      this.$scope.$apply();
      expect(this.controller.selected).toEqual(options.ITransferOptions[1]);
    });

    it('should load settings when user settings is Off', function () {
      this.controller.off = false;
      this.getOrgSettings.resolve(this.orgSettingResponseOff);
      this.getUserSettings.resolve(this.userSettingResponseOff['allowExternalTransfer']);
      this.$scope.$apply();
      expect(this.controller.selected).toEqual(options.ITransferOptions[2]);
    });

    it('should load settings when user settings is Off', function () {
      this.controller.default = null;
      this.getOrgSettings.resolve(this.orgSettingResponseOff);
      this.getUserSettings.resolve(this.userSettingResponseDefault['allowExternalTransfer']);
      this.$scope.$apply();
      expect(this.controller.selected).toEqual(options.ITransferOptions[0]);
    });
  });

  describe('reset form', () => {
    beforeEach(initComponent);
    it('should set form to pristine', function() {
      this.controller.reset();
      expect(this.controller.form.$pristine).toBeTruthy();
    });
  });

  describe('save form', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      spyOn(this.controller, 'reset');
    });

    it('should call success save when external transfer setting is saved', function () {
      this.saveExternalTransferDefer.resolve('success');
      this.controller.selected = 'Always Allow';
      this.controller.save();
      this.$scope.$digest();
      expect(this.Notification.success).toHaveBeenCalledWith('serviceSetupModal.externalTransfer.success');
      expect(this.controller.reset).toHaveBeenCalled();
    });

    it('should call error save when external transfer setting is not saved', function () {
      this.saveExternalTransferDefer.reject('failure');
      this.controller.selected = 'Never Allow';
      this.controller.save();
      this.$scope.$digest();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      expect(this.controller.reset).not.toHaveBeenCalled();
    });
  });
});
