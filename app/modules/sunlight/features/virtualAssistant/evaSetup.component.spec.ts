import evaSetupModule from './evaSetup.component';

describe('Care Expert Virtual Assistant Setup Component', () => {
  const escapeKey = 27;
  const OrgName = 'Test-Org-Name';
  const OrgId = 'Test-Org-Id';
  const pages = [
    {
      name: 'evaOverview',
      previousButtonState: 'hidden',
      nextButtonState: true,
    },
    {
      name: 'vaName',
      previousButtonState: true,
      nextButtonState: false,
    },
    {
      name: 'evaEmail',
      previousButtonState: true,
      nextButtonState: false,
    },
    {
      name: 'vaSummary',
      previousButtonState: true,
      nextButtonState: 'hidden',
    },
  ];
  const expectedPageTemplate = {
    templateId: jasmine.any(String),
    name: jasmine.any(String),
    configuration: {
      mediaType: 'virtualAssistant',
      pages: {
      },
    },
  };
  //fill in expected PageTemplate pages from Pages array above.
  pages.forEach(function (page) { expectedPageTemplate.configuration.pages[page.name] = jasmine.any(Object); });

  const getForm = function(inputName): any {
    return {
      [inputName]: {
        $setValidity: jasmine.createSpy('$setValidity'),
      },
    };
  };

  const expectedStates = Object.keys(expectedPageTemplate.configuration.pages);

  const getDummyLogo = function (data) {
    return {
      data: data,
    };
  };

  const failedData = {
    success: false,
    status: 403,
    Errors: [{
      errorCode: '100106',
    }],
  };

  const dummyLogoUrl = 'https://www.example.com/logo.png';

  let getLogoDeferred, getLogoUrlDeferred, controller;

  beforeEach(function () {
    this.initModules('Sunlight', evaSetupModule);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      '$stateParams',
      '$modal',
      '$timeout',
      'CTService',
      'Analytics',
      'Authinfo',
      'Notification',
      'EvaService',
      'SparkService',
    );

    //create mock deferred object which will be used to return promises
    getLogoDeferred = this.$q.defer();
    getLogoUrlDeferred = this.$q.defer();

    spyOn(this.$modal, 'open');
    spyOn(this.CTService, 'getLogo').and.returnValue(getLogoDeferred.promise);
    spyOn(this.CTService, 'getLogoUrl').and.returnValue(getLogoUrlDeferred.promise);
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.Analytics, 'trackEvent');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(OrgId);
    spyOn(this.Authinfo, 'getOrgName').and.returnValue(OrgName);
    spyOn(Date, 'now').and.returnValues(10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10);


    this.compileComponent('eva-setup', {
      dismiss: 'dismiss()',
    });

    controller = this.controller;
  });

  function checkStateOfNavigationButtons(pageIndex: number, previousButtonState: any, nextButtonState: any): void {
    controller.currentState = controller.states[pageIndex];
    expect(controller.previousButton()).toEqual(previousButtonState);
    expect(controller.nextButton()).toEqual(nextButtonState);
  }

  describe('should test the', function () {
    let deferred;
    beforeEach(function () {
      deferred = this.$q.defer();
      spyOn(controller, 'getText').and.returnValue(deferred.promise);
    });

    it('getTitle', function () {
      controller.getTitle();
      expect(controller.getText).toHaveBeenCalledWith('createTitle');
    });

    it('getTitle with isEditFeature true', function () {
      controller.isEditFeature = true;
      controller.getTitle();
      expect(controller.getText).toHaveBeenCalledWith('editTitle');
    });

    it('getSummaryDescription', function () {
      controller.template.configuration.pages.vaName.nameValue = 'testName';
      controller.getSummaryDescription();
      expect(controller.getText).toHaveBeenCalledWith('summary.desc', { name: controller.template.configuration.pages.vaName.nameValue });
    });

    it('getSummaryDescription with isEditFeature true', function () {
      controller.isEditFeature = true;
      controller.template.configuration.pages.vaName.nameValue = 'testName';
      controller.getSummaryDescription();
      expect(controller.getText).toHaveBeenCalledWith('summary.editDesc', { name: controller.template.configuration.pages.vaName.nameValue });
    });
  });

  describe('Page Structures', function () {
    beforeEach(function () {
      getLogoDeferred.resolve(getDummyLogo('abcd'));
      getLogoUrlDeferred.resolve(dummyLogoUrl);
      this.$scope.$apply();
    });

    it('States correlate to pages', function () {
      expect(controller.states).toEqual(expectedStates);
    });

    it('First state is initial state', function () {
      expect(controller.currentState).toEqual(controller.states[0]);
    });

    it('keyboard functionality', function () {
      controller.evalKeyPress(escapeKey);
      expect(this.$modal.open).toHaveBeenCalled();
    });

    it('Walk pages forward in order ', function () {
      for (let i = 0; i < controller.states.length; i++) {
        expect(controller.currentState).toEqual(controller.states[i]);
        controller.nextPage();
        expect(this.Analytics.trackEvent).toHaveBeenCalledWith(controller.template.configuration.pages[controller.currentState].eventName, { durationInMillis: 0 });
        this.Analytics.trackEvent.calls.reset();
        this.$timeout.flush();
      }
    });

    it('Walk pages Backward in order ', function () {
      controller.currentState = controller.states[controller.states.length - 1];
      for (let i = (controller.states.length - 1); 0 <= i; i--) {
        expect(controller.currentState).toEqual(controller.states[i]);
        controller.previousPage();
        this.$timeout.flush();
      }
    });

    pages.forEach(function (expectedPage, index) {
      it(expectedPage.name + ': previous button should be ' + (expectedPage.previousButtonState ? 'Enabled' : 'Disabled') +
        ' and next button should be ' + (expectedPage.nextButtonState ? 'Enabled' : 'Disabled'), function () {
        checkStateOfNavigationButtons(index, expectedPage.previousButtonState, expectedPage.nextButtonState);
      });

      it(expectedPage.name + ': make sure template file exists for page ' + expectedPage.name + '.tpl.html\'', function () {
        const expectedPageFilename = 'modules/sunlight/features/virtualAssistant/wizardPages/' + expectedPage.name + '.tpl.html';
        controller.currentState = controller.states[index];
        expect(controller.getCurrentPage()).toEqual(expectedPageFilename);
      });
    });
  });

  describe('vaName Page', function () {
    beforeEach(function () {
      controller.nameForm = getForm('nameInput');
    });

    it ('isNameValid to return true when name input field is populated and less than maxNameLength', function () {
      controller.template.configuration.pages.vaName.nameValue = 'testUser';

      const isNameValid = controller.isNameValid();
      expect(controller.nameForm.nameInput.$setValidity).toHaveBeenCalledWith(controller.NameErrorMessages.ERROR_CHAR_50, true);
      expect(isNameValid).toBe(true);
    });

    it ('isNameValid to return false when name input field is empty', function () {
      controller.template.configuration.pages.vaName.nameValue = '';

      const isNameValid = controller.isNameValid();
      expect(isNameValid).toBe(true);
    });

    it ('isNameValid to return false when name is longer than maxNameLength', function () {
      controller.template.configuration.pages.vaName.nameValue = '123456789012345678901234567890123456789012345678901';

      const isNameValid = controller.isNameValid();
      expect(controller.nameForm.nameInput.$setValidity).toHaveBeenCalledWith(controller.NameErrorMessages.ERROR_CHAR_50, false);
      expect(isNameValid).toBe(false);
    });

    it ('isNamePageValid to return false when name input field is empty', function () {
      controller.template.configuration.pages.vaName.nameValue = '';

      spyOn(this.controller, 'isNameValid').and.returnValue(true);
      const isNameValid = controller.isNamePageValid();
      expect(isNameValid).toBe(false);
    });
  });

  describe('evaEmail Page', function () {
    beforeEach(function () {
      controller.emailForm = getForm('emailInput');
    });

    it('isEmailpageValid should return true when emailForm is $valid and email input is populated', function () {
      controller.template.configuration.pages.evaEmail.value = 'zyx89';
      controller.emailForm.$valid = true;

      const isEmailPageValid = controller.isEmailPageValid();
      expect(isEmailPageValid).toBe(true);
    });

    it('isEmailPageValid should return false when email input field is empty', function () {
      controller.template.configuration.pages.evaEmail.value = '';
      controller.emailForm.$valid = true;

      const isEmailPageValid = controller.isEmailPageValid();
      expect(isEmailPageValid).toBe(false);
    });

    it('isEmailPageValid should return false when emailForm is NOT $valid', function () {
      controller.template.configuration.pages.evaEmail.value = 'a@b';
      controller.emailForm.$valid = false;

      const isEmailPageValid = controller.isEmailPageValid();
      expect(isEmailPageValid).toBe(false);
    });
  });

  describe('Summary Page', function () {
    let deferred;
    beforeEach(function () {
      deferred = this.$q.defer();
      spyOn(this.EvaService, 'addExpertAssistant').and.returnValue(deferred.promise);
    });

    it("When save template failed, the 'saveTemplateErrorOccurred' is set", function () {
      //by default, this flag is false
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      deferred.reject(failedData);

      controller.submitFeature();
      this.$scope.$apply();

      const featureNameObj = { featureName: 'careChatTpl.virtualAssistant.eva.featureText.name' };
      expect(controller.saveTemplateErrorOccurred).toBeTruthy();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(failedData, jasmine.any(String), featureNameObj);
    });

    it('should submit template successfully', function () {
      //by default, this flag is false
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();

      spyOn(this.$state, 'go');
      deferred.resolve({
        success: true,
        botServicesConfigId: 'AnExpertAssistantId',
        status: 201,
      });

      controller.submitFeature();
      this.$scope.$apply();

      expect(this.Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
        featureName: jasmine.any(String),
      });
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      expect(this.$state.go).toHaveBeenCalled();
      expect(this.Analytics.trackEvent).toHaveBeenCalledWith(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_SUMMARY_PAGE, { durationInMillis: 10 });
      expect(this.Analytics.trackEvent).toHaveBeenCalledWith(this.Analytics.sections.VIRTUAL_ASSISTANT.eventNames.EVA_START_FINISH, { durationInMillis: 0 });
    });
  });
});
