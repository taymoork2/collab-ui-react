import testModule from './index';
import { SipDomainSettingController } from './sipDomainSetting.controller';

describe('Controller: SipDomainSettingController', function () {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$controller',
      '$modal',
      '$rootScope',
      '$scope',
      '$timeout',
      '$translate',
      '$q',
      '$window',
      'Config',
      'FeatureToggleService',
      'Notification',
      'Orgservice',
      'ServiceDescriptorService',
      'SparkDomainManagementService',
      'UrlConfig',
    );

    this.orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
    this.domainSuffix = '.ciscospark.com';
    this.defaultInput = 'amtest2';
    this.testInput = 'test';
    this.unauthorizedError = 'firstTimeWizard.subdomain401And403Error';
    this.serverError = 'firstTimeWizard.sparkDomainManagementServiceErrorMessage';
    this.saveError = 'firstTimeWizard.subdomainSaveError';
    this.successNotification = 'firstTimeWizard.subdomainSaveSuccess';

    this.availableResponse = {
      data: {
        isDomainAvailable: true,
        isDomainReserved: false,
      },
    };
    this.unavailableResponse = _.cloneDeep(this.availableResponse);
    this.unavailableResponse.data.isDomainAvailable = false;
    this.unavailableResponse.data.isDomainReserved = true;

    this.ERROR_FIVE_HUNDRED = {
      status: 500,
    };
    this.ERROR_FIVE_ZERO_TWO = {
      status: 502,
    };
    this.ERROR_FOUR_HUNDRED = {
      status: 400,
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
    spyOn(this.$window, 'open');
    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.UrlConfig, 'getSparkDomainCheckUrl').and.returnValue(this.domainSuffix);
    spyOn(this.$scope, '$emit').and.callThrough();

    const AuthInfo = {
      getOrgId: 'bcd7afcd-839d-4c61-a7a8-31c6c7f016d7',
    };

    this.$scope.wizard = {
      nextTab: jasmine.createSpy('nextTab'),
    };

    spyOn(this.SparkDomainManagementService, 'addSipDomain').and.returnValue(this.$q.resolve({
      data: {
        isDomainAvailable: false,
        isDomainReserved: true,
      },
    }));

    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.resolve([{
      licenses: [{
        offerName: 'SD',
      }],
    }]));

    spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({ data: this.orgServiceJSONFixture.getOrg }));

    spyOn(this.ServiceDescriptorService, 'isServiceEnabled').and.returnValue(this.$q.resolve(true));

    this.initController = (): void => {
      this.controller = this.$controller(SipDomainSettingController, {
        $element: this.$element,
        $scope: this.$scope,
        $rootScope: this.$rootScope,
        $translate: this.$translate,
        $modal: this.$modal,
        Authinfo: AuthInfo,
        Notification: this.Notification,
        UrlConfig: this.UrlConfig,
        SparkDomainManagementService: this.SparkDomainManagementService,
        Orgservice: this.Orgservice,
      });

      this.$scope.$apply();
    };
  });

  describe('FeatureToggleService returns false', function () {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'atlasSubdomainUpdateGetStatus').and.returnValue(this.$q.resolve(false));

      spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.resolve({
        data: {
          isDomainAvailable: true,
          isDomainReserved: false,
        },
      }));
    });

    it('getOrg call on initialization should be called with correct parameters', function () {
      const params = {
        basicInfo: true,
      };
      this.initController();
      expect(this.Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), false, params);
    });

    it('initialization should gracefully error', function () {
      this.Orgservice.getOrg.and.returnValue(this.$q.reject());
      this.initController();

      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });

    it('initialization should emit wizardNextDisabled and', function () {
      this.initController();
      expect(this.$scope.$emit).toHaveBeenCalledWith('wizardNextButtonDisable', true);
      expect(this.controller.isRoomLicensed).toEqual(true);
    });

    it('should check if checkSipDomainAvailability in success state sets isUrlAvailable to true ', function () {
      this.initController();
      this.controller.inputValue = 'shatest1';
      this.controller.checkSipDomainAvailability().then(() => {
        expect(this.controller.isUrlAvailable).toEqual(true);
        expect(this.SparkDomainManagementService.checkDomainAvailability).toHaveBeenCalledWith(this.controller.inputValue);
      });
      this.$scope.$apply();
    });

    it('should disable the field and clear error on the field validation', function () {
      this.initController();
      this.controller._inputValue = this.controller._validatedValue = 'alalalalalong!';
      this.controller.isConfirmed = true;
      this.controller.saveDomain();
      this.$scope.$apply();
      expect(this.controller.isError).toEqual(false);
      expect(this.controller.isDisabled).toEqual(true);
    });

    it('should check if checkSipDomainAvailability in success state is set to false ', function () {
      this.initController();
      this.controller.inputValue = this.defaultInput;
      this.controller.checkSipDomainAvailability();
      expect(this.controller.isUrlAvailable).toEqual(false);
    });

    it('should enable Next button when isSSAReserved is true', function () {
      this.initController();
      this.controller.isSSAReserved = true;
      expect(this.$scope.$emit).toHaveBeenCalledWith('wizardNextButtonDisable', false);
    });

    it('should enable Next button when isSSARerved is false and depends on isConfirmed', function () {
      this.initController();
      this.controller.isSSAReserved = false;
      expect(this.$scope.$emit).toHaveBeenCalledWith('wizardNextButtonDisable', !this.controller.isConfirmed);
    });

    it('addSipDomain should error gracefully', function () {
      this.initController();
      this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.reject());

      this.controller._inputValue = this.controller._validatedValue = 'alalalalalong!';
      this.controller.isConfirmed = true;
      this.controller.saveDomain();
      this.$scope.$apply();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('FeatureToggleService returns true', function () {
    const helpUrl: string = 'https://collaborationhelp.cisco.com/article/en-us/DOC-7763';
    const blank: string = '_blank';
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
    };

    const getForm = function(): any {
      return {
        sipDomainInput: {
          $setValidity: jasmine.createSpy('$setValidity'),
        },
        $setPristine: jasmine.createSpy('$setPristine'),
        $setUntouched: jasmine.createSpy('$setUntouched'),
      };
    };

    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'atlasSubdomainUpdateGetStatus').and.returnValue(this.$q.resolve(true));
    });

    it('should load with expected defaults', function () {
      this.initController();
      expect(this.$translate.instant).toHaveBeenCalledTimes(4);
      expect(this.$scope.$emit).toHaveBeenCalledWith(broadcasts.DISMISS_DISABLE, true);
      expect(this.$scope.$emit).toHaveBeenCalledWith(broadcasts.DISMISS_DISABLE, false);
      expect(this.$scope.$emit).toHaveBeenCalledTimes(2);

      expect(this.controller.saving).toBeFalsy();
      expect(this.controller.toggle).toBeTruthy();
      expect(this.controller.showSaveButton).toBeFalsy();
      expect(this.controller.inputValue).toEqual(this.defaultInput);
      expect(this.controller.currentDisplayName).toEqual(this.defaultInput);
      expect(this.controller.domainSuffix).toEqual(this.domainSuffix);
      expect(this.controller.isRoomLicensed).toBeTruthy();
      expect(this.controller.isSSAReserved).toBeTruthy();
      expect(this.controller.sipForm).toBeFalsy();
      expect(this.controller.verified).toBeFalsy();
      expect(this.controller.subdomainCount).toEqual(2);
      expect(this.controller.form).toBeUndefined();

      _.forEach(this.controller.messages, (message: string, key: string) => {
        expect(message).toEqual(messages[key]);
      });

      _.forEach(broadcasts, (broadcast: string, key: string) => {
        expect(this.controller[key]).toEqual(broadcast);
      });
    });

    it('emptyOrUnchangedInput should return true/false as expected based on inputValue and currentDisplayName', function () {
      this.initController();
      expect(this.controller.emptyOrUnchangedInput()).toBeTruthy();
      this.controller.inputValue = 'test';
      expect(this.controller.emptyOrUnchangedInput()).toBeFalsy();
      this.controller.inputValue = '';
      expect(this.controller.emptyOrUnchangedInput()).toBeTruthy();
    });

    it('notVerified should change verified to false and emit DISMISS_DISABLE broadcast as true', function () {
      this.initController();
      this.controller.verified = true;
      this.controller.notVerified();
      expect(this.controller.verified).toBeFalsy();
      expect(this.$scope.$emit.calls.mostRecent().args).toEqual([broadcasts.DISMISS_DISABLE, true]);
    });

    it('openSipHelpWiki should open url in new window', function () {
      this.initController();
      this.controller.openSipHelpWiki();
      expect(this.$window.open).toHaveBeenCalledTimes(1);
      expect(this.$window.open).toHaveBeenCalledWith(helpUrl, blank);
    });

    it('toggleSipForm should turn the input form on/off and reset defaults', function () {
      this.initController();
      this.controller.inputValue = this.testInput;
      this.controller.verified = true;
      this.controller.form = getForm();

      this.controller.toggleSipForm();
      expect(this.controller.sipForm).toBeTruthy();
      expect(this.controller.inputValue).toEqual(this.defaultInput);
      expect(this.controller.verified).toBeFalsy();
      expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(2);
      expect(this.controller.form.sipDomainInput.$setValidity.calls.allArgs()).toEqual([[ subdomainUnavailable, true ], [ invalidSubdomain, true ]]);
      expect(this.controller.form.$setPristine).toHaveBeenCalledTimes(1);
      expect(this.controller.form.$setUntouched).toHaveBeenCalledTimes(1);
      expect(this.$scope.$emit.calls.mostRecent().args).toEqual([broadcasts.DISMISS_DISABLE, false]);
      expect(this.$scope.$emit).toHaveBeenCalledTimes(3);
      expect(this.$rootScope.$broadcast.calls.mostRecent().args).toEqual([broadcasts.REMOVE_SAVE_BUTTONS]);
      expect(this.$rootScope.$broadcast).toHaveBeenCalledTimes(3);

      this.controller.isSSAReserved = false;
      this.controller.toggleSipForm();
      expect(this.controller.sipForm).toBeFalsy();
      expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(4);
      expect(this.controller.form.$setPristine).toHaveBeenCalledTimes(2);
      expect(this.controller.form.$setUntouched).toHaveBeenCalledTimes(2);
      expect(this.$scope.$emit.calls.mostRecent().args).toEqual([broadcasts.DISMISS_DISABLE, true]);
      expect(this.$scope.$emit).toHaveBeenCalledTimes(4);
    });

    it('should return focus to #editSubdomainLink', function () {
      this.initController();
      this.controller.resetFocus();
      this.$timeout.flush();
      expect(this.$element.find).toHaveBeenCalledWith('#editSubdomainLink');
      expect(this.focus).toHaveBeenCalledTimes(1);
    });

    describe('verifyAvailabilityAndValidity should set controller.verified based on the inputValue', function () {
      beforeEach(function () {
        this.initController();
      });

      it('available response', function () {
        spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.resolve(this.availableResponse));
        this.controller.form = getForm();
        this.controller.verifyAvailabilityAndValidity();
        this.$scope.$apply();

        expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(2);
        expect(this.controller.form.sipDomainInput.$setValidity.calls.allArgs()).toEqual([[subdomainUnavailable, true], [invalidSubdomain, true]]);
        expect(this.$rootScope.$broadcast.calls.mostRecent().args).toEqual([broadcasts.ACTIVATE_SAVE_BUTTONS]);
        expect(this.controller.verified).toBeTruthy();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);
      });

      it('unavailable', function () {
        spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.resolve(this.unavailableResponse));
        this.controller.form = getForm();
        this.controller.verifyAvailabilityAndValidity();
        this.$scope.$apply();

        expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(3);
        expect(this.controller.form.sipDomainInput.$setValidity.calls.mostRecent().args).toEqual([subdomainUnavailable, false]);
        expect(this.controller.verified).toBeFalsy();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);
      });

      it('inputValue equals invalidInput', function () {
        spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.reject(this.ERROR_FOUR_HUNDRED));
        this.controller.form = getForm();
        this.controller.verifyAvailabilityAndValidity();
        this.$scope.$apply();

        expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(3);
        expect(this.controller.form.sipDomainInput.$setValidity.calls.mostRecent().args).toEqual([invalidSubdomain, false]);
        expect(this.controller.verified).toBeFalsy();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);
      });

      it('error response', function () {
        spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.reject(this.ERROR_FIVE_HUNDRED));
        this.controller.form = getForm();
        this.controller.verifyAvailabilityAndValidity();
        this.$scope.$apply();

        expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(0);
        expect(this.controller.verified).toBeFalsy();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
        expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([this.ERROR_FIVE_HUNDRED, this.serverError]);
      });

      it('unauthorized response', function () {
        spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.reject(this.ERROR_FOUR_ZERO_ONE));
        this.controller.form = getForm();
        this.controller.verifyAvailabilityAndValidity();
        this.$scope.$apply();

        expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(0);
        expect(this.controller.verified).toBeFalsy();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
        expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([this.ERROR_FOUR_ZERO_ONE, this.unauthorizedError]);
      });
    });

    describe('first time wizard broadcast', function () {
      beforeEach(function () {
        this.initController();
      });

      it('should not save if inputValue is not updated', function () {
        this.controller.form = getForm();
        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        this.$scope.$apply();

        expect(this.SparkDomainManagementService.addSipDomain).not.toHaveBeenCalled();
        expect(this.controller.currentDisplayName).toEqual(this.defaultInput);
        expect(this.controller.form.sipDomainInput.$setValidity).not.toHaveBeenCalled();
        expect(this.controller.form.$setPristine).not.toHaveBeenCalled();
        expect(this.controller.form.$setUntouched).not.toHaveBeenCalled();
      });

      it('should save after inputValue is updated', function () {
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.resolve(this.unavailableResponse));
        this.controller.form = getForm();
        this.controller.inputValue = this.testInput;
        this.controller.isSSAReserved = false;

        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        this.$timeout.flush();
        this.$scope.$apply();

        expect(this.controller.saving).toBeFalsy();
        expect(this.controller.verified).toBeFalsy();
        expect(this.controller.sipForm).toBeFalsy();
        expect(this.controller.currentDisplayName).toEqual(this.testInput);
        expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(2);
        expect(this.controller.form.sipDomainInput.$setValidity.calls.allArgs()).toEqual([[subdomainUnavailable, true], [invalidSubdomain, true]]);
        expect(this.controller.form.$setPristine).toHaveBeenCalledTimes(1);
        expect(this.controller.form.$setUntouched).toHaveBeenCalledTimes(1);
        expect(this.Notification.success).not.toHaveBeenCalled();
      });

      it('should signal an error if save returns with isDomainReserved as false', function () {
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.resolve(this.availableResponse));
        this.controller.form = getForm();
        this.controller.inputValue = this.testInput;
        this.controller.isSSAReserved = false;

        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        this.$timeout.flush();
        this.$scope.$apply();

        expect(this.controller.saving).toBeFalsy();
        expect(this.controller.verified).toBeFalsy();
        expect(this.controller.currentDisplayName).toEqual(this.defaultInput);
        expect(this.Notification.error.calls.mostRecent().args).toEqual([this.saveError]);
      });

      it('should signal a save error for a 502 error', function () {
        this.SparkDomainManagementService.addSipDomain.and.callFake(() => {
          return this.$q.reject(this.ERROR_FIVE_ZERO_TWO);
        });
        this.controller.form = getForm();
        this.controller.inputValue = this.testInput;
        this.controller.isSSAReserved = false;

        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        this.$timeout.flush();
        this.$scope.$apply();

        expect(this.controller.saving).toBeFalsy();
        expect(this.controller.verified).toBeFalsy();
        expect(this.controller.currentDisplayName).toEqual(this.defaultInput);
        expect(this.controller.form.sipDomainInput.$setValidity).not.toHaveBeenCalled();
        expect(this.controller.form.$setPristine).not.toHaveBeenCalled();
        expect(this.controller.form.$setUntouched).not.toHaveBeenCalled();
        expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([this.ERROR_FIVE_ZERO_TWO, this.saveError]);
      });

      it('should signal an unauthorized error for a 401 error', function () {
        this.SparkDomainManagementService.addSipDomain.and.callFake(() => {
          return this.$q.reject(this.ERROR_FOUR_ZERO_ONE);
        });
        this.controller.form = getForm();
        this.controller.inputValue = this.testInput;
        this.controller.isSSAReserved = false;
        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        this.$timeout.flush();
        this.$scope.$apply();
        expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([this.ERROR_FOUR_ZERO_ONE, this.unauthorizedError]);
      });

      it('should signal a server error for a 500 error', function () {
        this.SparkDomainManagementService.addSipDomain.and.callFake(() => {
          return this.$q.reject(this.ERROR_FIVE_HUNDRED);
        });
        this.controller.form = getForm();
        this.controller.inputValue = this.testInput;
        this.controller.isSSAReserved = false;
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
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.resolve(this.unavailableResponse));

        this.controller.form = getForm();
        this.controller.inputValue = this.testInput;
        this.controller.showSaveButton = true;
        this.$rootScope.$emit(broadcasts.SAVE_BROADCAST);
        this.$scope.$apply();

        expect(this.controller.currentDisplayName).toEqual(this.testInput);
        expect(this.controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(2);
        expect(this.controller.form.sipDomainInput.$setValidity.calls.allArgs()).toEqual([[subdomainUnavailable, true], [invalidSubdomain, true]]);
        expect(this.controller.form.$setPristine).toHaveBeenCalledTimes(1);
        expect(this.controller.form.$setUntouched).toHaveBeenCalledTimes(1);
        expect(this.Notification.success).toHaveBeenCalledTimes(1);
        expect(this.Notification.success).toHaveBeenCalledWith(this.successNotification);
        expect(this.$modal.open).toHaveBeenCalledWith(this.saveModal);
      });

      it('should reactivate save/cancel buttons if modal has "no" selected', function () {
        spyOn(this.$modal, 'open').and.returnValue({
          result: this.$q.reject(false),
        });
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.resolve(this.unavailableResponse));

        this.controller.form = getForm();
        this.controller.inputValue = this.testInput;
        this.controller.showSaveButton = true;
        this.$rootScope.$broadcast.calls.reset();
        this.$rootScope.$emit(broadcasts.SAVE_BROADCAST);
        this.$scope.$apply();

        expect(this.$rootScope.$broadcast).toHaveBeenCalledTimes(1);
        expect(this.$rootScope.$broadcast).toHaveBeenCalledWith(broadcasts.ACTIVATE_SAVE_BUTTONS);
        expect(this.$rootScope.$broadcast.calls.mostRecent().args).toEqual([broadcasts.ACTIVATE_SAVE_BUTTONS]);

        expect(this.controller.currentDisplayName).toEqual(this.defaultInput);
        expect(this.controller.form.sipDomainInput.$setValidity).not.toHaveBeenCalled();
        expect(this.controller.form.$setPristine).not.toHaveBeenCalled();
        expect(this.controller.form.$setUntouched).not.toHaveBeenCalled();
        expect(this.Notification.success).not.toHaveBeenCalled();
        expect(this.$modal.open).toHaveBeenCalledWith(this.saveModal);
      });

      it('should toggle the form off on the cancel broadcast', function () {
        this.controller.form = getForm();
        this.controller.inputValue = this.testInput;
        this.controller.sipForm = true;
        this.$rootScope.$emit(broadcasts.CANCEL_BROADCAST);
        expect(this.controller.sipForm).toBeFalsy();
        expect(this.controller.inputValue).toEqual(this.defaultInput);
        expect(this.controller.verified).toBeFalsy();
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
});
