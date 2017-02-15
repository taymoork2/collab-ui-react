describe('Controller: EnterpriseSettingsCtrl', function () {
  let controller, initController;
  let orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');

  const domainSuffix: string = '.ciscospark.com';
  const defaultInput: string = 'amtest2';
  const testInput: string = 'test';
  const unauthorizedError: string = 'firstTimeWizard.subdomain401And403Error';
  const serverError: string = 'firstTimeWizard.sparkDomainManagementServiceErrorMessage';
  const saveError: string = 'firstTimeWizard.subdomainSaveError';
  const successNotification: string = 'firstTimeWizard.subdomainSaveSuccess';

  const availableResponse = {
    data: {
      isDomainAvailable: true,
      isDomainReserved: false,
    },
  };

  const unavailableResponse = {
    data: {
      isDomainAvailable: false,
      isDomainReserved: true,
    },
  };

  const ERROR_FIVE_HUNDRED = {
    status: 500,
  };

  const ERROR_FIVE_ZERO_TWO = {
    status: 502,
  };

  const ERROR_FOUR_HUNDRED = {
    status: 400,
  };

  const ERROR_FOUR_ZERO_ONE = {
    status: 401,
  };

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$controller', '$rootScope', '$scope', '$translate', '$q', '$window', 'Config',
      'FeatureToggleService', 'ModalService', 'Notification', 'Orgservice', 'SparkDomainManagementService', 'UrlConfig');

    spyOn(this.$rootScope, '$broadcast').and.callThrough();
    spyOn(this.$window, 'open');
    spyOn (this.$translate, 'instant').and.callThrough();
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.UrlConfig, 'getSparkDomainCheckUrl').and.returnValue(domainSuffix);
    spyOn(this.$scope, '$emit').and.callThrough();

    let AuthInfo = {
      getOrgId: 'bcd7afcd-839d-4c61-a7a8-31c6c7f016d7',
    };

    this.$scope.wizard = {
      nextTab: jasmine.createSpy('nextTab'),
    };

    spyOn(this.SparkDomainManagementService, 'addSipDomain').and.returnValue(this.$q.when({
      data: {
        isDomainAvailable: false,
        isDomainReserved: true,
      },
    }));

    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when([{
      licenses: [{
        offerName: 'SD',
      }],
    }]));

    spyOn(this.Orgservice, 'getOrg').and.callFake((callback) => {
      callback(orgServiceJSONFixture.getOrg, 200);
    });

    initController = (): void => {
      controller = this.$controller('SipDomainSettingController', {
        $scope: this.$scope,
        $rootScope: this.$rootScope,
        $translate: this.$translate,
        Authinfo: AuthInfo,
        Notification: this.Notification,
        UrlConfig: this.UrlConfig,
        SparkDomainManagementService: this.SparkDomainManagementService,
        Orgservice: this.Orgservice,
        ModalService: this.ModalService,
      });

      this.$scope.$apply();
    };
  });

  describe('FeatureToggleService returns false', function () {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'atlasSubdomainUpdateGetStatus').and.returnValue(this.$q.when(false));

      spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.when({
        data: {
          isDomainAvailable: true,
          isDomainReserved: false,
        },
      }));
    });

    it('initialization should gracefully error', function () {
      this.Orgservice.getOrg.and.callFake((callback) => {
        callback(orgServiceJSONFixture.getOrg, 201);
      });
      initController();

      expect(this.Notification.error).toHaveBeenCalled();
    });

    it('initialization should emit wizardNextDisabled and', function () {
      initController();
      expect(this.$scope.$emit).toHaveBeenCalledWith('wizardNextButtonDisable', true);
      expect(controller.isRoomLicensed).toEqual(true);
    });

    it('should check if checkSipDomainAvailability in success state sets isUrlAvailable to true ', function () {
      initController();
      controller.inputValue = 'shatest1';
      controller.checkSipDomainAvailability().then(() => {
        expect(controller.isUrlAvailable).toEqual(true);
        expect(this.SparkDomainManagementService.checkDomainAvailability).toHaveBeenCalledWith(controller.inputValue);
      });
      this.$scope.$apply();
    });

    it('should disable the field and clear error on the field validation', function () {
      initController();
      controller._inputValue = controller._validatedValue = 'alalalalalong!';
      controller.isConfirmed = true;
      controller.saveDomain();
      this.$scope.$apply();
      expect(controller.isError).toEqual(false);
      expect(controller.isDisabled).toEqual(true);
    });

    it('should check if checkSipDomainAvailability in success state is set to false ', function () {
      initController();
      controller.inputValue = defaultInput;
      controller.checkSipDomainAvailability();
      expect(controller.isUrlAvailable).toEqual(false);
    });

    it('should enable Next button when isSSAReserved is true', function () {
      initController();
      controller.isSSAReserved = true;
      expect(this.$scope.$emit).toHaveBeenCalledWith('wizardNextButtonDisable', false);
    });

    it('should enable Next button when isSSARerved is false and depends on isConfirmed', function () {
      initController();
      controller.isSSAReserved = false;
      expect(this.$scope.$emit).toHaveBeenCalledWith('wizardNextButtonDisable', !controller.isConfirmed);
    });

    it('addSipDomain should error gracefully', function () {
      this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.reject());
      initController();

      controller._inputValue = controller._validatedValue = 'alalalalalong!';
      controller.isConfirmed = true;
      controller.saveDomain();
      this.$scope.$apply();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('FeatureToggleService returns true', function () {
    const helpUrl: string = 'https://help.webex.com/docs/DOC-7763';
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
      DISMISS_DISABLE: 'wizardNextButtonDisable',
    };

    let getForm = function(): any {
      return {
        sipDomainInput: {
          $setValidity: jasmine.createSpy('$setValidity'),
        },
        $setPristine: jasmine.createSpy('$setPristine'),
        $setUntouched: jasmine.createSpy('$setUntouched'),
      };
    };

    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'atlasSubdomainUpdateGetStatus').and.returnValue(this.$q.when(true));
    });

    it('should load with expected defaults', function () {
      initController();
      expect(this.$translate.instant).toHaveBeenCalledTimes(4);
      expect(this.$scope.$emit).toHaveBeenCalledWith(broadcasts.DISMISS_DISABLE, true);
      expect(this.$scope.$emit).toHaveBeenCalledWith(broadcasts.DISMISS_DISABLE, false);
      expect(this.$scope.$emit).toHaveBeenCalledTimes(2);

      expect(controller.saving).toBeFalsy();
      expect(controller.toggle).toBeTruthy();
      expect(controller.showSaveButton).toBeFalsy();
      expect(controller.inputValue).toEqual(defaultInput);
      expect(controller.currentDisplayName).toEqual(defaultInput);
      expect(controller.domainSuffix).toEqual(domainSuffix);
      expect(controller.isRoomLicensed).toBeTruthy();
      expect(controller.isSSAReserved).toBeTruthy();
      expect(controller.sipForm).toBeFalsy();
      expect(controller.verified).toBeFalsy();
      expect(controller.subdomainCount).toEqual(2);
      expect(controller.form).toBeUndefined();

      _.forEach(controller.messages, (message: string, key: string) => {
        expect(message).toEqual(messages[key]);
      });

      _.forEach(broadcasts, (broadcast: string, key: string) => {
        expect(controller[key]).toEqual(broadcast);
      });
    });

    it('emptyOrUnchangedInput should return true/false as expected based on inputValue and currentDisplayName', function () {
      initController();
      expect(controller.emptyOrUnchangedInput()).toBeTruthy();
      controller.inputValue = 'test';
      expect(controller.emptyOrUnchangedInput()).toBeFalsy();
      controller.inputValue = '';
      expect(controller.emptyOrUnchangedInput()).toBeTruthy();
    });

    it('notVerified should change verified to false and emit DISMISS_DISABLE broadcast as true', function () {
      initController();
      controller.verified = true;
      controller.notVerified();
      expect(controller.verified).toBeFalsy();
      expect(this.$scope.$emit.calls.mostRecent().args).toEqual([broadcasts.DISMISS_DISABLE, true]);
    });

    it('openSipHelpWiki should open url in new window', function () {
      initController();
      controller.openSipHelpWiki();
      expect(this.$window.open).toHaveBeenCalledTimes(1);
      expect(this.$window.open).toHaveBeenCalledWith(helpUrl, blank);
    });

    it('toggleSipForm should turn the input form on/off and reset defaults', function () {
      initController();
      controller.inputValue = testInput;
      controller.verified = true;
      controller.form = getForm();

      controller.toggleSipForm();
      expect(controller.sipForm).toBeTruthy();
      expect(controller.inputValue).toEqual(defaultInput);
      expect(controller.verified).toBeFalsy();
      expect(controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(2);
      expect(controller.form.sipDomainInput.$setValidity.calls.allArgs()).toEqual([[ subdomainUnavailable, true ], [ invalidSubdomain, true ]]);
      expect(controller.form.$setPristine).toHaveBeenCalledTimes(1);
      expect(controller.form.$setUntouched).toHaveBeenCalledTimes(1);
      expect(this.$scope.$emit.calls.mostRecent().args).toEqual([broadcasts.DISMISS_DISABLE, false]);
      expect(this.$scope.$emit).toHaveBeenCalledTimes(3);
      expect(this.$rootScope.$broadcast.calls.mostRecent().args).toEqual([broadcasts.REMOVE_SAVE_BUTTONS]);
      expect(this.$rootScope.$broadcast).toHaveBeenCalledTimes(3);

      controller.isSSAReserved = false;
      controller.toggleSipForm();
      expect(controller.sipForm).toBeFalsy();
      expect(controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(4);
      expect(controller.form.$setPristine).toHaveBeenCalledTimes(2);
      expect(controller.form.$setUntouched).toHaveBeenCalledTimes(2);
      expect(this.$scope.$emit.calls.mostRecent().args).toEqual([broadcasts.DISMISS_DISABLE, true]);
      expect(this.$scope.$emit).toHaveBeenCalledTimes(4);
    });

    describe('verifyAvailabilityAndValidity should set controller.verified based on the inputValue', function () {
      it('available response', function () {
        spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.when(availableResponse));
        initController();
        controller.form = getForm();
        controller.verifyAvailabilityAndValidity();
        this.$scope.$apply();

        expect(controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(2);
        expect(controller.form.sipDomainInput.$setValidity.calls.allArgs()).toEqual([[subdomainUnavailable, true], [invalidSubdomain, true]]);
        expect(this.$rootScope.$broadcast.calls.mostRecent().args).toEqual([broadcasts.ACTIVATE_SAVE_BUTTONS]);
        expect(controller.verified).toBeTruthy();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);
      });

      it('unavailable', function () {
        spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.when(unavailableResponse));
        initController();
        controller.form = getForm();
        controller.verifyAvailabilityAndValidity();
        this.$scope.$apply();

        expect(controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(3);
        expect(controller.form.sipDomainInput.$setValidity.calls.mostRecent().args).toEqual([subdomainUnavailable, false]);
        expect(controller.verified).toBeFalsy();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);
      });

      it('inputValue equals invalidInput', function () {
        spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.reject(ERROR_FOUR_HUNDRED));
        initController();
        controller.form = getForm();
        controller.verifyAvailabilityAndValidity();
        this.$scope.$apply();

        expect(controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(3);
        expect(controller.form.sipDomainInput.$setValidity.calls.mostRecent().args).toEqual([invalidSubdomain, false]);
        expect(controller.verified).toBeFalsy();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);
      });

      it('error response', function () {
        spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.reject(ERROR_FIVE_HUNDRED));
        initController();
        controller.form = getForm();
        controller.verifyAvailabilityAndValidity();
        this.$scope.$apply();

        expect(controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(0);
        expect(controller.verified).toBeFalsy();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
        expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([ERROR_FIVE_HUNDRED, serverError]);
      });

      it('unauthorized response', function () {
        spyOn(this.SparkDomainManagementService, 'checkDomainAvailability').and.returnValue(this.$q.reject(ERROR_FOUR_ZERO_ONE));
        initController();
        controller.form = getForm();
        controller.verifyAvailabilityAndValidity();
        this.$scope.$apply();

        expect(controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(0);
        expect(controller.verified).toBeFalsy();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
        expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([ERROR_FOUR_ZERO_ONE, unauthorizedError]);
      });
    });

    describe('first time wizard broadcast', function () {
      it('should not save if inputValue is not updated', function () {
        initController();
        controller.form = getForm();
        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        this.$scope.$apply();

        expect(this.SparkDomainManagementService.addSipDomain).not.toHaveBeenCalled();
        expect(controller.currentDisplayName).toEqual(defaultInput);
        expect(controller.form.sipDomainInput.$setValidity).not.toHaveBeenCalled();
        expect(controller.form.$setPristine).not.toHaveBeenCalled();
        expect(controller.form.$setUntouched).not.toHaveBeenCalled();
      });

      it('should save after inputValue is updated', function () {
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.when(unavailableResponse));
        initController();
        controller.form = getForm();
        controller.inputValue = testInput;

        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        expect(controller.saving).toBeTruthy();
        this.$scope.$apply();

        expect(controller.saving).toBeFalsy();
        expect(controller.verified).toBeFalsy();
        expect(controller.sipForm).toBeFalsy();
        expect(controller.currentDisplayName).toEqual(testInput);
        expect(controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(2);
        expect(controller.form.sipDomainInput.$setValidity.calls.allArgs()).toEqual([[subdomainUnavailable, true], [invalidSubdomain, true]]);
        expect(controller.form.$setPristine).toHaveBeenCalledTimes(1);
        expect(controller.form.$setUntouched).toHaveBeenCalledTimes(1);
        expect(this.Notification.success).not.toHaveBeenCalled();
      });

      it('should signal an error if save returns with isDomainReserved as false', function () {
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.when(availableResponse));
        initController();
        controller.form = getForm();
        controller.inputValue = testInput;

        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        expect(controller.saving).toBeTruthy();
        this.$scope.$apply();

        expect(controller.saving).toBeFalsy();
        expect(controller.verified).toBeFalsy();
        expect(controller.currentDisplayName).toEqual(defaultInput);
        expect(this.Notification.error.calls.mostRecent().args).toEqual([saveError]);
      });

      it('should signal a save error for a 502 error', function () {
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.reject(ERROR_FIVE_ZERO_TWO));
        initController();
        controller.form = getForm();
        controller.inputValue = testInput;

        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        expect(controller.saving).toBeTruthy();
        this.$scope.$apply();

        expect(controller.saving).toBeFalsy();
        expect(controller.verified).toBeFalsy();
        expect(controller.currentDisplayName).toEqual(defaultInput);
        expect(controller.form.sipDomainInput.$setValidity).not.toHaveBeenCalled();
        expect(controller.form.$setPristine).not.toHaveBeenCalled();
        expect(controller.form.$setUntouched).not.toHaveBeenCalled();
        expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([ERROR_FIVE_ZERO_TWO, saveError]);
      });

      it('should signal an unauthorized error for a 401 error', function () {
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.reject(ERROR_FOUR_ZERO_ONE));
        initController();
        controller.form = getForm();
        controller.inputValue = testInput;
        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        this.$scope.$apply();
        expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([ERROR_FOUR_ZERO_ONE, unauthorizedError]);
      });

      it('should signal a server error for a 500 error', function () {
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.reject(ERROR_FIVE_HUNDRED));
        initController();
        controller.form = getForm();
        controller.inputValue = testInput;
        this.$rootScope.$broadcast(broadcasts.WIZARD_BROADCAST);
        this.$scope.$apply();
        expect(this.Notification.errorWithTrackingId.calls.mostRecent().args).toEqual([ERROR_FIVE_HUNDRED, serverError]);
      });
    });

    describe('Account Settings Save and Cancel Options', function () {
      it('should verify through a modal', function () {
        spyOn(this.ModalService, 'open').and.returnValue({
          result: this.$q.when(true),
        });
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.when(unavailableResponse));
        initController();

        controller.form = getForm();
        controller.inputValue = testInput;
        controller.showSaveButton = true;
        this.$rootScope.$emit(broadcasts.SAVE_BROADCAST);
        this.$scope.$apply();

        expect(controller.currentDisplayName).toEqual(testInput);
        expect(controller.form.sipDomainInput.$setValidity).toHaveBeenCalledTimes(2);
        expect(controller.form.sipDomainInput.$setValidity.calls.allArgs()).toEqual([[subdomainUnavailable, true], [invalidSubdomain, true]]);
        expect(controller.form.$setPristine).toHaveBeenCalledTimes(1);
        expect(controller.form.$setUntouched).toHaveBeenCalledTimes(1);
        expect(this.Notification.success).toHaveBeenCalledTimes(1);
        expect(this.Notification.success).toHaveBeenCalledWith(successNotification);
      });

      it('should reactivate save\cancel buttons if modal has "no" selected', function () {
        spyOn(this.ModalService, 'open').and.returnValue({
          result: this.$q.reject(false),
        });
        this.SparkDomainManagementService.addSipDomain.and.returnValue(this.$q.when(unavailableResponse));
        initController();

        controller.form = getForm();
        controller.inputValue = testInput;
        controller.showSaveButton = true;
        this.$rootScope.$broadcast.calls.reset();
        this.$rootScope.$emit(broadcasts.SAVE_BROADCAST);
        this.$scope.$apply();

        expect(this.$rootScope.$broadcast).toHaveBeenCalledTimes(1);
        expect(this.$rootScope.$broadcast).toHaveBeenCalledWith(broadcasts.ACTIVATE_SAVE_BUTTONS);
        expect(this.$rootScope.$broadcast.calls.mostRecent().args).toEqual([broadcasts.ACTIVATE_SAVE_BUTTONS]);

        expect(controller.currentDisplayName).toEqual(defaultInput);
        expect(controller.form.sipDomainInput.$setValidity).not.toHaveBeenCalled();
        expect(controller.form.$setPristine).not.toHaveBeenCalled();
        expect(controller.form.$setUntouched).not.toHaveBeenCalled();
        expect(this.Notification.success).not.toHaveBeenCalled();
      });

      it('should toggle the form off on the cancel broadcast', function () {
        initController();
        controller.form = getForm();
        controller.inputValue = testInput;
        controller.sipForm = true;
        this.$rootScope.$emit(broadcasts.CANCEL_BROADCAST);
        expect(controller.sipForm).toBeFalsy();
        expect(controller.inputValue).toEqual(defaultInput);
        expect(controller.verified).toBeFalsy();
      });
    });

    it('checkRoomLicense function should set isRoomLicensed to false based on license returned', function () {
      this.Orgservice.getLicensesUsage.and.returnValue(this.$q.when([{
        licenses: [{
          offerName: 'CF',
        }],
      }]));
      initController();

      expect(controller.isRoomLicensed).toEqual(false);
    });
  });
});
