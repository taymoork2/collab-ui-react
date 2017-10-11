'use strict';
import { CvaSetupCtrl } from './cvaSetupCtrl';

describe('Customer Virtual Assistant Setup Ctrl', function () {
  const escapeKey = 27;
  const OrgName = 'Test-Org-Name';
  const OrgId = 'Test-Org-Id';
  const pages = [
    {
      name: 'cvaConfigOverview',
      previousButtonState: 'hidden',
      nextButtonState: false,
    },
    {
      name: 'cvaDialogIntegration',
      previousButtonState: true,
      nextButtonState: true,
    },
    {
      name: 'cvaAccessToken',
      previousButtonState: true,
      nextButtonState: false,
    },
    {
      name: 'vaName',
      previousButtonState: true,
      nextButtonState: false,

    },
    {
      name: 'vaAvatar',
      previousButtonState: true,
      nextButtonState: true,
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

  const expectedStates = Object.keys(expectedPageTemplate.configuration.pages);

  const spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(OrgId),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue(OrgName),
  };

  const getDummyLogo = function (data) {
    return {
      data: data,
    };
  };

  const dummyLogoUrl = 'https://www.example.com/logo.png';

  const failedData = {
    success: false,
    status: 403,
    Errors: [{
      errorCode: '100106',
    }],
  };
  let controller: CvaSetupCtrl, $controller, $q, $scope, $state, $stateParams, $modal, $timeout, CTService, Analytics, Notification, VirtualAssistantService;
  let getLogoDeferred, getLogoUrlDeferred;
  function resetVars() {
    $controller = $q = $scope = $state = $stateParams = $modal = CTService = Analytics = Notification = VirtualAssistantService = getLogoDeferred = getLogoUrlDeferred = undefined;
  }
  function invokeCtrl() {
    controller = <CvaSetupCtrl>$controller('CvaSetupCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
    });
  }
  function initializeCtrl(invokeTheCtrl?, isEditFeature?) {
    return function (_$controller_, _$q_, $rootScope, _$state_, _$stateParams_, _$modal_, _$timeout_, _CTService_, _Analytics_, _Notification_, _VirtualAssistantService_) {
      $scope = $rootScope.$new();
      $modal = _$modal_;
      $q = _$q_;
      $timeout = _$timeout_;
      CTService = _CTService_;
      VirtualAssistantService = _VirtualAssistantService_;
      $state = _$state_;
      $stateParams = _$stateParams_;
      Notification = _Notification_;
      Analytics = _Analytics_;

      //create mock deferred object which will be used to return promises
      getLogoDeferred = $q.defer();
      getLogoUrlDeferred = $q.defer();
      spyOn($modal, 'open');
      spyOn(CTService, 'getLogo').and.returnValue(getLogoDeferred.promise);
      spyOn(CTService, 'getLogoUrl').and.returnValue(getLogoUrlDeferred.promise);
      spyOn(Notification, 'success');
      spyOn(Notification, 'error');
      spyOn(Notification, 'errorWithTrackingId');
      spyOn(Analytics, 'trackEvent');
      spyOn(Date, 'now').and.returnValues(0, 10, 10, 10, 10, 10, 10);
      $stateParams.isEditFeature = isEditFeature;
      $controller = _$controller_;
      if (invokeTheCtrl) {
        invokeCtrl();
      }
    };
  }
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));
  afterEach(resetVars);

  function repeatString(str: string, count: number): string {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += str;
    }
    return result;
  }

  function checkStateOfNavigationButtons(pageIndex: number, previousButtonState: any, nextButtonState: any): void {
    controller.currentState = controller.states[pageIndex];
    expect(controller.previousButton()).toEqual(previousButtonState);
    expect(controller.nextButton()).toEqual(nextButtonState);
  }

  function resolveLogoPromise() {
    getLogoDeferred.resolve(getDummyLogo('abcd'));
    $scope.$apply();
  }

  function resolveLogoUrlPromise() {
    getLogoUrlDeferred.resolve(dummyLogoUrl);
    $scope.$apply();
  }

  describe('should test the', function () {
    let deferred;
    beforeEach(inject(initializeCtrl(true)));
    beforeEach(function () {
      deferred = $q.defer();
      spyOn(controller, 'getVaText').and.returnValue(deferred.promise);
    });

    it('getTitle', function () {
      controller.getTitle();
      expect(controller.getVaText).toHaveBeenCalledWith('createTitle');
    });

    it('getTitle with isEditFeature true', function () {
      controller.isEditFeature = true;
      controller.getTitle();
      expect(controller.getVaText).toHaveBeenCalledWith('editTitle');
    });

    it('getSummaryDescription', function () {
      controller.getSummaryDescription();
      expect(controller.getVaText).toHaveBeenCalledWith('summary.desc');
    });

    it('getSummaryDescription with isEditFeature true', function () {
      controller.isEditFeature = true;
      controller.getSummaryDescription();
      expect(controller.getVaText).toHaveBeenCalledWith('summary.editDesc');
    });
  });

  describe('Page Structures', function () {
    beforeEach(inject(initializeCtrl(true)));
    beforeEach(function () {
      resolveLogoPromise();
      resolveLogoUrlPromise();
    });

    it('States correlate to pages', function () {
      expect(controller.states).toEqual(expectedStates);
    });

    it('First state is initial state', function () {
      expect(controller.currentState).toEqual(controller.states[0]);
    });

    it('keyboard functionality', function () {
      controller.evalKeyPress(escapeKey);
      expect($modal.open).toHaveBeenCalled();
    });

    it('Walk pages forward in order ', function () {
      for (let i = 0; i < controller.states.length; i++) {
        expect(controller.currentState).toEqual(controller.states[i]);
        controller.nextPage();
        expect(Analytics.trackEvent).toHaveBeenCalledWith(controller.template.configuration.pages[controller.currentState].eventName, { durationInMillis: 10 });
        Analytics.trackEvent.calls.reset();
        $timeout.flush();
      }
    });

    it('Walk pages Backward in order ', function () {
      controller.currentState = controller.states[controller.states.length - 1];
      for (let i = (controller.states.length - 1); 0 <= i; i--) {
        expect(controller.currentState).toEqual(controller.states[i]);
        controller.previousPage();
        $timeout.flush();
      }
    });

    pages.forEach(function (expectedPage, index) {
      it(expectedPage.name + ': previous button should be ' + (expectedPage.previousButtonState ? 'Enabled' : 'Disabled') +
        ' and next button should be ' + (expectedPage.nextButtonState ? 'Enabled' : 'Disabled'), function () {
        checkStateOfNavigationButtons(index, expectedPage.previousButtonState, expectedPage.nextButtonState);
      });

      it(expectedPage.name + ': make sure template file exists for page va' + expectedPage.name + '.tpl.html\'', function () {
        const expectedPageFilename = 'modules/sunlight/features/virtualAssistant/wizardPages/' + expectedPage.name + '.tpl.html';
        controller.currentState = controller.states[index];
        expect(controller.getCurrentPage()).toEqual(expectedPageFilename);
      });
    });
  });

  const getForm = function(inputName): any {
    return {
      [inputName]: {
        $setValidity: jasmine.createSpy('$setValidity'),
      },
    };
  };

  describe('Field Checks on All Pages with fields', function () {
    const CONFIG_OVERVIEW_PAGE_INDEX = 0;
    const ACCESS_TOKEN_PAGE_INDEX = 2;
    const NAME_PAGE_INDEX = 3;

    beforeEach(inject(initializeCtrl(true)));
    beforeEach(function () {
      controller.nameForm = getForm('nameInput');
    });

    it('Next button on Config Overview Page enabled when isApiAiAgentConfigured is true', function () {
      controller.template.configuration.pages.cvaConfigOverview.isApiAiAgentConfigured = true;
      checkStateOfNavigationButtons(CONFIG_OVERVIEW_PAGE_INDEX, 'hidden', true);
    });

    it('Next button on Config Overview Page disabled when isApiAiAgentConfigured is false', function () {
      controller.template.configuration.pages.cvaConfigOverview.isApiAiAgentConfigured = false;
      checkStateOfNavigationButtons(CONFIG_OVERVIEW_PAGE_INDEX, 'hidden', false);
    });

    it('Next button on Access Token Page enabled when accessTokenValue is valid and validation not needed', function () {
      controller.template.configuration.pages.cvaAccessToken.accessTokenValue = '123';
      controller.template.configuration.pages.cvaAccessToken.invalidToken = true;
      controller.template.configuration.pages.cvaAccessToken.needsValidation = false;
      checkStateOfNavigationButtons(ACCESS_TOKEN_PAGE_INDEX, true, false);

      controller.template.configuration.pages.cvaAccessToken.invalidToken = false;
      checkStateOfNavigationButtons(ACCESS_TOKEN_PAGE_INDEX, true, true);
    });

    it('Next button on Access Token Page disabled when accessTokenValue is valid and needs validation', function () {
      controller.template.configuration.pages.cvaAccessToken.accessTokenValue = '123';
      controller.template.configuration.pages.cvaAccessToken.invalidToken = true;
      controller.template.configuration.pages.cvaAccessToken.needsValidation = true;
      checkStateOfNavigationButtons(ACCESS_TOKEN_PAGE_INDEX, true, false);

      controller.template.configuration.pages.cvaAccessToken.invalidToken = false;
      checkStateOfNavigationButtons(ACCESS_TOKEN_PAGE_INDEX, true, false);
    });

    it('Next button on Name Page enabled when nameValue is not empty', function () {
      controller.template.configuration.pages.vaName.nameValue = 'Hello World';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, true);
    });

    it('Next button on Name Page disabled when nameValue too long', function () {
      controller.template.configuration.pages.vaName.nameValue = repeatString('X', controller.maxNameLength);
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, true);

      controller.template.configuration.pages.vaName.nameValue = repeatString('X', controller.maxNameLength + 1);
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, false);
    });

    it('Next button on Name Page disabled when nameValue is empty', function () {
      controller.template.configuration.pages.vaName.nameValue = '';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, false);
    });

    it('Next button on Name Page disabled when nameValue is only spaces', function () {
      controller.template.configuration.pages.vaName.nameValue = '  ';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, false);
    });

    it('Next button on Name Page disabled when nameValue is not unique', function () {
      controller.service.featureList.data = [{ name: 'hi i am baymax', id: '1' }];
      controller.template.configuration.pages.vaName.nameValue = 'Hi I am Baymax';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, false);

      controller.template.configuration.pages.vaName.nameValue = 'Baymax';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, true);
    });

    it('Next and Back button on Avatar Page disabled when avatar file is loading', function () {
      controller.avatarUploadState = controller.avatarState.LOADING;
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, false, false);
    });

    it('Next button on Avatar Page enabled when avatar file error', function () {
      controller.avatarUploadState = controller.avatarState.PREVIEW;
      controller.template.configuration.pages.vaAvatar.avatarError = 'FileUploadError';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, true, false);
    });
  });
  describe('AccessToken Page', function () {
    let deferred;
    beforeEach(inject(initializeCtrl(true)));
    beforeEach(function () {
      deferred = $q.defer();
      spyOn(VirtualAssistantService, 'isAPIAITokenValid').and.returnValue(deferred.promise);

      controller.tokenForm = getForm('tokenInput');
    });

    it('should validateToken successfully', function () {
      deferred.resolve(true);
      controller.template.configuration.pages.cvaAccessToken.invalidToken = true;
      controller.template.configuration.pages.cvaAccessToken.needsValidation = true;

      controller.validateAPIAIToken();
      $scope.$apply();

      expect(controller.template.configuration.pages.cvaAccessToken.invalidToken).toEqual(false);
      expect(controller.template.configuration.pages.cvaAccessToken.needsValidation).toEqual(false);
    });

    it('should validateToken unsuccessfully', function () {
      deferred.reject(false);
      controller.template.configuration.pages.cvaAccessToken.invalidToken = false;
      controller.template.configuration.pages.cvaAccessToken.needsValidation = true;

      controller.validateAPIAIToken();
      $scope.$apply();

      expect(controller.template.configuration.pages.cvaAccessToken.invalidToken).toEqual(true);
      expect(controller.template.configuration.pages.cvaAccessToken.needsValidation).toEqual(false);
    });
  });
  describe('Avatar Page', function () {
    let deferredFileDataUrl;
    beforeEach(inject(initializeCtrl(true)));
    beforeEach(function() {
      deferredFileDataUrl = $q.defer();
      spyOn(VirtualAssistantService, 'getFileDataUrl').and.returnValue(deferredFileDataUrl.promise);
    });

    it('should validate avatar file type', function () {
      deferredFileDataUrl.resolve('');
      const size = 1000;
      controller.template.configuration.pages.vaAvatar.avatarError = controller.avatarErrorType.NO_ERROR;
      controller.uploadAvatar({ name: 'abc.jpeg', size });
      expect(controller.template.configuration.pages.vaAvatar.avatarError).toEqual(controller.avatarErrorType.FILE_TYPE_ERROR);

      controller.template.configuration.pages.vaAvatar.avatarError = controller.avatarErrorType.NO_ERROR;
      controller.uploadAvatar({ name: 'abc.png', size });
      expect(controller.template.configuration.pages.vaAvatar.avatarError).toEqual(controller.avatarErrorType.NO_ERROR);
    });

    it('should validate avatar file size', function () {
      deferredFileDataUrl.resolve('');
      controller.template.configuration.pages.vaAvatar.avatarError = controller.avatarErrorType.NO_ERROR;
      controller.uploadAvatar({ name: 'abc.png' , size: controller.MAX_AVATAR_FILE_SIZE + 1 });
      expect(controller.template.configuration.pages.vaAvatar.avatarError).toEqual(controller.avatarErrorType.FILE_SIZE_ERROR);

      controller.template.configuration.pages.vaAvatar.avatarError = controller.avatarErrorType.NO_ERROR;
      controller.uploadAvatar({ name: 'abc.png' , size: 0 });
      expect(controller.template.configuration.pages.vaAvatar.avatarError).toEqual(controller.avatarErrorType.FILE_SIZE_ERROR);

      controller.template.configuration.pages.vaAvatar.avatarError = controller.avatarErrorType.NO_ERROR;
      controller.uploadAvatar({ name: 'abc.png' , size: controller.MAX_AVATAR_FILE_SIZE });
      expect(controller.template.configuration.pages.vaAvatar.avatarError).toEqual(controller.avatarErrorType.NO_ERROR);
    });
  });
  describe('Summary Page', function () {
    let deferred;
    beforeEach(inject(initializeCtrl(true)));
    beforeEach(function () {
      deferred = $q.defer();
      spyOn(VirtualAssistantService, 'addConfig').and.returnValue(deferred.promise);
      spyOn(VirtualAssistantService, 'updateConfig').and.returnValue(deferred.promise);
    });

    it("When save template failed, the 'saveTemplateErrorOccurred' is set", function () {
      //by default, this flag is false
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      deferred.reject(failedData);

      controller.submitFeature();
      $scope.$apply();

      expect(controller.saveTemplateErrorOccurred).toBeTruthy();
      expect(Notification.errorWithTrackingId).toHaveBeenCalledWith(failedData, jasmine.any(String));
    });

    it('should submit template successfully', function () {
      //by default, this flag is false
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();

      spyOn($state, 'go');
      deferred.resolve({
        success: true,
        botServicesConfigId: 'ABotConfigurationId',
        status: 201,
      });

      controller.submitFeature();
      $scope.$apply();

      expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
        featureName: jasmine.any(String),
      });
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      expect($state.go).toHaveBeenCalled();
      expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_SUMMARY_PAGE, { durationInMillis: 10 });
      expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_START_FINISH, { durationInMillis: 10 });
    });

    it('should submit template successfully for Edit', function () {
      //by default, this flag is false
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      controller.isEditFeature = true;
      spyOn($state, 'go');
      deferred.resolve({
        success: true,
        status: 200,
      });
      controller.submitFeature();
      $scope.$apply();

      expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
        featureName: jasmine.any(String),
      });
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      expect($state.go).toHaveBeenCalled();
      expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_SUMMARY_PAGE, { durationInMillis: 10 });
      expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.VIRTUAL_ASSISTANT.eventNames.CVA_START_FINISH, { durationInMillis: 10 });
    });

    it('should submit template failed for Edit', function () {
      //by default, this flag is false
      expect(controller.saveTemplateErrorOccurred).toBeFalsy();
      deferred.reject(failedData);
      controller.isEditFeature = true;

      controller.submitFeature();
      $scope.$apply();

      expect(controller.saveTemplateErrorOccurred).toBeTruthy();
      expect(Notification.errorWithTrackingId).toHaveBeenCalledWith(failedData, jasmine.any(String));
    });
  });
});
