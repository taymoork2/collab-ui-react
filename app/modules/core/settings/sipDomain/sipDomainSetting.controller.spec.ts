import { SipAddressModel } from 'modules/core/shared/sip-address/sip-address.model';
import moduleName from './index';
import { SipDomainSettingController } from './sipDomainSetting.controller';

describe('Controller: SipDomainSettingController', function () {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$controller',
      '$modal',
      '$rootScope',
      '$scope',
      '$timeout',
      '$translate',
      'Config',
      'Notification',
      'Orgservice',
      'ServiceDescriptorService',
      'SipAddressService',
    );

    this.defaultInput = 'amtest2';
    this.testInput = 'test';
    this.unauthorizedError = 'firstTimeWizard.subdomain401And403Error';
    this.serverError = 'firstTimeWizard.sparkDomainManagementServiceErrorMessage';
    this.saveError = 'firstTimeWizard.subdomainSaveError';
    this.successNotification = 'firstTimeWizard.subdomainSaveSuccess';

    this.availableResponse = {
      isDomainAvailable: true,
      isDomainInvalid: false,
    };
    this.unavailableResponse = _.cloneDeep(this.availableResponse);
    this.unavailableResponse.isDomainAvailable = false;
    this.unavailableResponse.isDomainInvalid = false;

    this.invalidResponse = _.cloneDeep(this.availableResponse);
    this.invalidResponse.isDomainAvailable = false;
    this.invalidResponse.isDomainInvalid = true;

    this.unreservedSaveResponse = {
      isDomainReserved: false,
    };

    this.ERROR_FIVE_HUNDRED = {
      status: 500,
    };
    this.ERROR_FIVE_ZERO_TWO = {
      status: 502,
    };
    this.ERROR_FOUR_ZERO_ONE = {
      status: 401,
    };

    this.modal = {
      type: 'dialog',
    };

    this.focus = jasmine.createSpy('focus');
    this.$element = {
      find: jasmine.createSpy('find').and.returnValue({ focus: this.focus }),
    };

    spyOn(this.$rootScope, '$broadcast').and.callThrough();
    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.$scope, '$emit').and.callThrough();

    this.$scope.wizard = {
      nextTab: jasmine.createSpy('nextTab'),
    };

    spyOn(this.SipAddressService, 'saveSipAddress').and.returnValue(this.$q.resolve({
      isDomainAvailable: false,
      isDomainReserved: true,
    }));

    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.resolve([{
      licenses: [{
        offerName: 'SD',
      }],
    }]));

    spyOn(this.SipAddressService, 'loadSipAddressModel').and.returnValue(this.$q.resolve(new SipAddressModel({
      atlasJ9614SipUriRebranding: false,
      isProd: true,
      sipCloudDomain: 'amtest2.ciscospark.com',
    })));

    spyOn(this.ServiceDescriptorService, 'isServiceEnabled').and.returnValue(this.$q.resolve(true));

    this.initController = (): void => {
      this.controller = this.$controller(SipDomainSettingController, {
        $element: this.$element,
        $scope: this.$scope,
      });
      this.controller.$onInit();

      this.$scope.$apply();
    };
  });

  const subdomainUnavailable: string = 'subdomainUnavailable';
  const invalidSubdomain: string = 'invalidSubdomain';

  const messages = {
    invalidSubdomain: 'firstTimeWizard.subdomainInvalid',
    maxlength: 'firstTimeWizard.longSubdomain',
    required: 'firstTimeWizard.required',
    subdomainUnavailable: 'firstTimeWizard.subdomainUnavailable',
  };

  const broadcasts = {
    ACTIVATE_SAVE_BUTTONS: 'settings-control-activate-footer',
    REMOVE_SAVE_BUTTONS: 'settings-control-remove-footer',
    SAVE_BROADCAST: 'settings-control-save',
    CANCEL_BROADCAST: 'settings-control-cancel',
    DISMISS_BROADCAST: 'DISMISS_SIP_NOTIFICATION',
    WIZARD_BROADCAST: 'wizard-enterprise-sip-url-event',
    WIZARD_EMIT: 'wizard-enterprise-sip-save',
    DISMISS_DISABLE: 'wizardNextButtonDisable',
    WIZARD_NEXT_LOADING: 'wizardNextButtonLoading',
  };

  const getForm = function (): any {
    return {
      sipDomainInput: {
        $setValidity: jasmine.createSpy('$setValidity'),
      },
      $setPristine: jasmine.createSpy('$setPristine'),
      $setUntouched: jasmine.createSpy('$setUntouched'),
    };
  };

  it('should load with expected defaults', function () {
    this.initController();
    expect(this.$translate.instant).toHaveBeenCalledTimes(4);
    expect(this.$scope.$emit).toHaveBeenCalledWith(broadcasts.DISMISS_DISABLE, true);
    expect(this.$scope.$emit).toHaveBeenCalledWith(broadcasts.DISMISS_DISABLE, false);
    expect(this.$scope.$emit).toHaveBeenCalledTimes(2);

    expect(this.controller.isSaving).toBe(false);
    expect(this.controller.showSaveButton).toBeUndefined();
    expect(this.controller.subdomain).toEqual(this.defaultInput);
    expect(this.controller.isRoomLicensed).toBe(true);
    expect(this.controller.isDomainReserved).toBe(true);
    expect(this.controller.isEditMode).toBe(false);
    expect(this.controller.isDomainAvailable).toBe(false);
    expect(this.controller.subdomainCount).toEqual(2);
    expect(this.controller.form).toBeUndefined();

    _.forEach(this.controller.messages, (message: string, key: string) => {
      expect(message).toEqual(messages[key]);
    });

    _.forEach(broadcasts, (broadcast: string, key: string) => {
      expect(this.controller[key]).toEqual(broadcast);
    });
  });

  it('isEmptyOrUnchangedInput should return expected value if model has changed', function () {
    this.initController();
    expect(this.controller.isEmptyOrUnchangedInput).toBe(true);
    this.controller.subdomain = 'test';
    expect(this.controller.isEmptyOrUnchangedInput).toBe(false);
    this.controller.subdomain = '';
    expect(this.controller.isEmptyOrUnchangedInput).toBe(true);
  });

  it('resetDomainAvailability() should change isDomainAvailable to false and emit DISMISS_DISABLE broadcast as true', function () {
    this.initController();
    this.controller.isDomainAvailable = true;
    this.controller.resetDomainAvailability();
    expect(this.controller.isDomainAvailable).toBe(false);
    expect(this.$scope.$emit.calls.mostRecent().args).toEqual([broadcasts.DISMISS_DISABLE, true]);
  });

  it('toggleSipForm should turn the input form on/off and reset defaults', function () {
    this.initController();
    this.controller.subdomain = this.testInput;
    this.controller.isDomainAvailable = true;
    this.controller.form = getForm();

    this.$scope.$emit.calls.reset();

    this.controller.toggleSipForm();
    expect(this.controller.isEditMode).toBe(true);
    expect(this.controller.subdomain).toEqual(this.defaultInput);
    expect(this.controller.isDomainAvailable).toBe(false);
    expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(2);
    expect(this.controller.form.sipDomainInput.$setValidity.calls.allArgs()).toEqual([[subdomainUnavailable, true], [invalidSubdomain, true]]);
    expect(this.controller.form.$setPristine).toHaveBeenCalledTimes(1);
    expect(this.controller.form.$setUntouched).toHaveBeenCalledTimes(1);
    expect(this.$scope.$emit.calls.argsFor(0)).toEqual([broadcasts.DISMISS_DISABLE, false]);
    expect(this.$scope.$emit.calls.argsFor(1)).toEqual([broadcasts.REMOVE_SAVE_BUTTONS]);
    expect(this.$scope.$emit).toHaveBeenCalledTimes(2);

    this.$scope.$emit.calls.reset();

    this.controller.isDomainReserved = false;
    this.controller.toggleSipForm();
    expect(this.controller.isEditMode).toBe(false);
    expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(4);
    expect(this.controller.form.$setPristine).toHaveBeenCalledTimes(2);
    expect(this.controller.form.$setUntouched).toHaveBeenCalledTimes(2);
    expect(this.$scope.$emit.calls.argsFor(0)).toEqual([broadcasts.DISMISS_DISABLE, true]);
    expect(this.$scope.$emit).toHaveBeenCalledTimes(1);
  });

  it('should return focus to #editSubdomainLink', function () {
    this.initController();
    this.controller.resetFocus();
    this.$timeout.flush();
    expect(this.$element.find).toHaveBeenCalledWith('#editSubdomainLink');
    expect(this.focus).toHaveBeenCalledTimes(1);
  });

  describe('verifyAvailabilityAndValidity should set controller.isDomainAvailable', function () {
    beforeEach(function () {
      this.initController();
    });

    it('available response', function () {
      spyOn(this.SipAddressService, 'validateSipAddress').and.returnValue(this.$q.resolve(this.availableResponse));
      this.controller.form = getForm();
      this.controller.verifyAvailabilityAndValidity();
      this.$scope.$apply();

      expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(2);
      expect(this.controller.form.sipDomainInput.$setValidity.calls.allArgs()).toEqual([[subdomainUnavailable, true], [invalidSubdomain, true]]);
      expect(this.$scope.$emit.calls.mostRecent().args).toEqual([broadcasts.ACTIVATE_SAVE_BUTTONS]);
      expect(this.controller.isDomainAvailable).toBe(true);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);
    });

    it('unavailable response', function () {
      spyOn(this.SipAddressService, 'validateSipAddress').and.returnValue(this.$q.resolve(this.unavailableResponse));
      this.controller.form = getForm();
      this.controller.verifyAvailabilityAndValidity();
      this.$scope.$apply();

      expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(3);
      expect(this.controller.form.sipDomainInput.$setValidity.calls.mostRecent().args).toEqual([subdomainUnavailable, false]);
      expect(this.controller.isDomainAvailable).toBe(false);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);
    });

    it('invalid response', function () {
      spyOn(this.SipAddressService, 'validateSipAddress').and.returnValue(this.$q.resolve(this.invalidResponse));
      this.controller.form = getForm();
      this.controller.verifyAvailabilityAndValidity();
      this.$scope.$apply();

      expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(3);
      expect(this.controller.form.sipDomainInput.$setValidity.calls.mostRecent().args).toEqual([invalidSubdomain, false]);
      expect(this.controller.isDomainAvailable).toBe(false);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);
    });

    it('error response', function () {
      spyOn(this.SipAddressService, 'validateSipAddress').and.returnValue(this.$q.reject(this.ERROR_FIVE_HUNDRED));
      this.controller.form = getForm();
      this.controller.verifyAvailabilityAndValidity();
      this.$scope.$apply();

      expect(this.controller.isDomainAvailable).toBe(false);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([this.ERROR_FIVE_HUNDRED, this.serverError]);
    });

    it('unauthorized response', function () {
      spyOn(this.SipAddressService, 'validateSipAddress').and.returnValue(this.$q.reject(this.ERROR_FOUR_ZERO_ONE));
      this.controller.form = getForm();
      this.controller.verifyAvailabilityAndValidity();
      this.$scope.$apply();

      expect(this.controller.isDomainAvailable).toBe(false);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([this.ERROR_FOUR_ZERO_ONE, this.unauthorizedError]);
    });
  });

  describe('first time wizard broadcast', function () {
    beforeEach(function () {
      this.initController();
    });

    it('should not save if model is not updated', function () {
      this.controller.form = getForm();
      this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
      this.$scope.$apply();

      expect(this.SipAddressService.saveSipAddress).not.toHaveBeenCalled();
      expect(this.controller.form.sipDomainInput.$setValidity).not.toHaveBeenCalled();
      expect(this.controller.form.$setPristine).not.toHaveBeenCalled();
      expect(this.controller.form.$setUntouched).not.toHaveBeenCalled();
    });

    it('should save after model is updated', function () {
      this.SipAddressService.saveSipAddress.and.returnValue(this.$q.resolve(this.unreservedSaveResponse));
      this.controller.form = getForm();
      this.controller.subdomain = this.testInput;
      this.controller.isDomainReserved = false;

      this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
      this.$timeout.flush();
      this.$scope.$apply();

      expect(this.controller.isSaving).toBe(false);
      expect(this.controller.isDomainAvailable).toBe(false);
      expect(this.controller.isEditMode).toBe(false);
      expect(this.SipAddressService.saveSipAddress).toHaveBeenCalled();
      expect(this.Notification.success).not.toHaveBeenCalled();
    });

    it('should signal an error if save returns with isDomainReserved as false', function () {
      this.SipAddressService.saveSipAddress.and.returnValue(this.$q.resolve(this.availableResponse));
      this.controller.form = getForm();
      this.controller.subdomain = this.testInput;
      this.controller.isDomainReserved = false;

      this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
      this.$timeout.flush();
      this.$scope.$apply();

      expect(this.controller.isSaving).toBe(false);
      expect(this.controller.isDomainAvailable).toBe(false);
      expect(this.SipAddressService.saveSipAddress).toHaveBeenCalled();
      expect(this.Notification.error.calls.mostRecent().args).toEqual([this.saveError]);
    });

    it('should signal a save error for a 502 error', function () {
      this.SipAddressService.saveSipAddress.and.callFake(() => {
        return this.$q.reject(this.ERROR_FIVE_ZERO_TWO);
      });
      this.controller.form = getForm();
      this.controller.subdomain = this.testInput;
      this.controller.isDomainReserved = false;

      this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
      this.$timeout.flush();
      this.$scope.$apply();

      expect(this.controller.isSaving).toBe(false);
      expect(this.controller.isDomainAvailable).toBe(false);
      expect(this.SipAddressService.saveSipAddress).toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([this.ERROR_FIVE_ZERO_TWO, this.saveError]);
    });

    it('should signal an unauthorized error for a 401 error', function () {
      this.SipAddressService.saveSipAddress.and.callFake(() => {
        return this.$q.reject(this.ERROR_FOUR_ZERO_ONE);
      });
      this.controller.form = getForm();
      this.controller.subdomain = this.testInput;
      this.controller.isDomainReserved = false;
      this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
      this.$timeout.flush();
      this.$scope.$apply();
      expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([this.ERROR_FOUR_ZERO_ONE, this.unauthorizedError]);
    });

    it('should signal a server error for a 500 error', function () {
      this.SipAddressService.saveSipAddress.and.callFake(() => {
        return this.$q.reject(this.ERROR_FIVE_HUNDRED);
      });
      this.controller.form = getForm();
      this.controller.subdomain = this.testInput;
      this.controller.isDomainReserved = false;
      this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
      this.$timeout.flush();
      this.$scope.$apply();
      expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([this.ERROR_FIVE_HUNDRED, this.serverError]);
    });
  });

  describe('Function editSubdomain - ', function () {
    it('when CSC is enabled should do nothing', function () {
      spyOn(this.$modal, 'open');
      this.initController();
      spyOn(this.controller, 'toggleSipForm').and.callThrough();

      this.controller.editSubdomain();
      this.$scope.$apply();
      expect(this.$modal.open).not.toHaveBeenCalled();
      this.$timeout.flush();
      expect(this.controller.toggleSipForm).not.toHaveBeenCalled();
      expect(this.$element.find).not.toHaveBeenCalled();
    });

    it('should only call toggleSipForm', function () {
      this.ServiceDescriptorService.isServiceEnabled.and.returnValue(this.$q.resolve(false));
      spyOn(this.$modal, 'open');
      this.initController();
      spyOn(this.controller, 'toggleSipForm').and.callThrough();

      this.controller.editSubdomain();
      this.$scope.$apply();
      expect(this.$modal.open).not.toHaveBeenCalled();
      expect(this.controller.toggleSipForm).toHaveBeenCalledTimes(1);
      this.$timeout.flush();
      expect(this.$element.find).toHaveBeenCalledWith('#sipDomainInput');
      expect(this.focus).toHaveBeenCalledTimes(1);
    });
  });

  describe('Account Settings Save and Cancel Options', function () {
    beforeEach(function () {
      this.initController();
      this.saveModal = _.cloneDeep(this.modal);
      this.saveModal.template = require('modules/core/settings/sipDomain/updateSipDomainWarning.tpl.html');
    });

    it('should verify through a modal', function () {
      spyOn(this.$modal, 'open').and.returnValue({
        result: this.$q.resolve(true),
      });

      this.controller.form = getForm();
      this.controller.subdomain = this.testInput;
      this.controller.showSaveButton = true;
      this.$rootScope.$emit(broadcasts.SAVE_BROADCAST);
      this.$scope.$apply();

      expect(this.$modal.open).toHaveBeenCalledWith(this.saveModal);
      expect(this.SipAddressService.saveSipAddress).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalledTimes(1);
      expect(this.Notification.success).toHaveBeenCalledWith(this.successNotification);
    });

    it('should reactivate save/cancel buttons if modal has "no" selected', function () {
      spyOn(this.$modal, 'open').and.returnValue({
        result: this.$q.reject(false),
      });

      this.controller.form = getForm();
      this.controller.subdomain = this.testInput;
      this.controller.showSaveButton = true;
      this.$scope.$emit.calls.reset();
      this.$rootScope.$emit(broadcasts.SAVE_BROADCAST);
      this.$scope.$apply();

      expect(this.$scope.$emit.calls.argsFor(0)).toEqual([broadcasts.WIZARD_NEXT_LOADING, true]);
      expect(this.$scope.$emit.calls.argsFor(1)).toEqual([broadcasts.ACTIVATE_SAVE_BUTTONS]);
      expect(this.$scope.$emit.calls.argsFor(2)).toEqual([broadcasts.WIZARD_NEXT_LOADING, false]);
      expect(this.$modal.open).toHaveBeenCalledWith(this.saveModal);
      expect(this.SipAddressService.saveSipAddress).not.toHaveBeenCalled();
      expect(this.Notification.success).not.toHaveBeenCalled();
    });

    it('should toggle the form off on the cancel broadcast', function () {
      this.controller.form = getForm();
      this.controller.subdomain = this.testInput;
      this.controller.isEditMode = true;
      this.$rootScope.$emit(broadcasts.CANCEL_BROADCAST);
      expect(this.controller.isEditMode).toBe(false);
      expect(this.controller.subdomain).toEqual(this.defaultInput);
      expect(this.controller.isDomainAvailable).toBe(false);
    });
  });

  it('checkRoomLicense function should set isRoomLicensed to false based on license returned', function () {
    this.Orgservice.getLicensesUsage.and.returnValue(this.$q.resolve([{
      licenses: [{
        offerName: 'CF',
      }],
    }, {
      licenses: [{
        offerName: 'CF',
      }],
    }]));
    this.initController();

    expect(this.controller.isRoomLicensed).toEqual(false);
  });

  it('checkRoomLicense function should set isRoomLicensed to true based on license returned [Spark Board]', function () {
    this.Orgservice.getLicensesUsage.and.returnValue(this.$q.resolve([{
      licenses: [{
        offerName: 'CF',
      }],
    }, {
      licenses: [{
        offerName: 'SD',
      }],
    }]));
    this.initController();

    expect(this.controller.isRoomLicensed).toEqual(true);
  });

  it('checkRoomLicense function should set isRoomLicensed to true based on license returned [Shared Devices]', function () {
    this.Orgservice.getLicensesUsage.and.returnValue(this.$q.resolve([{
      licenses: [{
        offerName: 'CF',
      }],
    }, {
      licenses: [{
        offerName: 'SB',
      }],
    }]));
    this.initController();

    expect(this.controller.isRoomLicensed).toEqual(true);
  });
});
