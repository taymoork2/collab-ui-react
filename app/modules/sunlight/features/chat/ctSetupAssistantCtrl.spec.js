'use strict';

describe('Care Chat Setup Assistant Ctrl', function () {

  var controller, $scope, $modal, $q, $timeout, $window, Authinfo, CTService, getLogoDeferred, SunlightConfigService, $state;
  var Notification;

  var escapeKey = 27;
  var templateName = 'Atlas UT Chat Template';
  var NAME_PAGE_INDEX = 0;
  var PROFILE_PAGE_INDEX = 1;
  var OVERVIEW_PAGE_INDEX = 2;
  var CUSTOMER_PAGE_INDEX = 3;
  var FEEDBACK_PAGE_INDEX = 4;
  var AGENT_UNAVAILABLE_PAGE_INDEX = 5;
  var OFF_HOURS_PAGE_INDEX = 6;
  var CHAT_STATUS_MESSAGES_PAGE_INDEX = 7;
  var EMBED_CODE_PAGE_INDEX = 8;
  var OrgName = 'Test-Org-Name';
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('Test-Org-Id'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue(OrgName)
  };

  var getDummyLogo = function (data) {
    return {
      data: data
    };
  };

  var failedData = {
    success: false,
    status: 403,
    Errors: [{
      errorCode: '100106'
    }]
  };

  var successData = {
    success: true,
    status: 201
  };

  var deSelectAllDays = function () {
    _.forEach(controller.days, function (day, key) {
      if (day.isSelected) {
        controller.setDay(key);
      }
    });
  };

  var selectedDaysByDefault = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  var defaultTimeZone = {
    label: 'United States: America/New_York',
    value: 'America/New_York'
  };
  var defaultDayPreview = 'Monday - Friday';

  beforeEach(module('Sunlight'));
  beforeEach(module('Hercules'));
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);

    $provide.value("SunlightConfigService", {
      createChatTemplate: function (data) {
        return {
          then: function (callback) {
            return callback(successData);
          }
        };
      }
    });
  }));

  var intializeCtrl = function (_$rootScope_, $controller, _$modal_, _$q_, _$timeout_,
    _$window_, _Authinfo_, _CTService_, _SunlightConfigService_, _$state_, _Notification_) {
    $scope = _$rootScope_.$new();
    $modal = _$modal_;
    $q = _$q_;
    $timeout = _$timeout_;
    $window = _$window_;
    Authinfo = _Authinfo_;
    CTService = _CTService_;
    SunlightConfigService = _SunlightConfigService_;
    $state = _$state_;
    Notification = _Notification_;

    //create mock deferred object which will be used to return promises
    getLogoDeferred = $q.defer();
    spyOn($modal, 'open');
    spyOn(CTService, 'getLogo').and.returnValue(getLogoDeferred.promise);
    spyOn(Notification, 'success');

    controller = $controller('CareChatSetupAssistantCtrl');
  };

  function checkStateOfNavigationButtons(pageIndex, previousButtonState, nextButtonState) {
    controller.currentState = controller.states[pageIndex];
    expect(controller.previousButton(pageIndex)).toEqual(previousButtonState);
    expect(controller.nextButton()).toEqual(nextButtonState);
  }

  function validateKeyPressEvent(eventKey, currentPageIndex, expectedPageIndex, isFlushTimeout) {
    controller.currentState = controller.states[currentPageIndex];
    controller.evalKeyPress(eventKey);
    if (isFlushTimeout) $timeout.flush();
    $scope.$apply();
    expect(controller.currentState).toEqual(controller.states[expectedPageIndex]);
  }

  function resolveLogoPromise() {
    getLogoDeferred.resolve(getDummyLogo('abcd'));
    $scope.$apply();
  }

  function rejectLogoPromise() {
    getLogoDeferred.reject({
      status: 500
    });
    $scope.$apply();
  }

  describe('should test the', function () {

    beforeEach(inject(intializeCtrl));
    beforeEach(function () {
      resolveLogoPromise();
    });

    it("it starts from the name page", function () {
      controller.currentState = controller.states[NAME_PAGE_INDEX];
      expect(controller.getPageIndex()).toEqual(NAME_PAGE_INDEX);
    });

    it("behavior of navigation buttons", function () {
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, 'hidden', false);
      checkStateOfNavigationButtons(EMBED_CODE_PAGE_INDEX, true, 'hidden');
    });

    it("keyboard functionality", function () {
      controller.evalKeyPress(escapeKey);
      expect($modal.open).toHaveBeenCalled();
    });
  });

  describe('Name Page', function () {
    beforeEach(inject(intializeCtrl));
    beforeEach(function () {
      resolveLogoPromise();
    });
    it("next button should be enabled when name is present", function () {
      controller.template.name = templateName;
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, 'hidden', true);
    });

    it("next button should be disabled when name is not present", function () {
      controller.template.name = '';
      checkStateOfNavigationButtons(NAME_PAGE_INDEX, 'hidden', false);
    });
  });

  describe('Feedback Page', function () {
    beforeEach(inject(intializeCtrl));
    beforeEach(function () {
      controller.currentState = controller.states[4];
    });

    it('next and previous buttons should be enabled by default', function () {
      controller.template.name = templateName;
      controller.currentState = controller.states[FEEDBACK_PAGE_INDEX];
      expect(controller.previousButton()).toEqual(true);
      expect(controller.nextButton()).toEqual(true);
    });
  });

  describe('Profile Page', function () {
    beforeEach(inject(intializeCtrl));
    beforeEach(function () {
      controller.currentState = controller.states[1];
    });
    it('set Organization name and prev/next should be enabled', function () {
      resolveLogoPromise();
      expect(controller.orgName).toEqual(OrgName);
      checkStateOfNavigationButtons(PROFILE_PAGE_INDEX, true, true);
    });

    it('next btn should disabled when org name is not present', function () {
      resolveLogoPromise();
      controller.orgName = '';
      checkStateOfNavigationButtons(PROFILE_PAGE_INDEX, true, false);
    });

    it('should set agent preview names based on selected agent profile', function () {
      resolveLogoPromise();
      controller.selectedAgentProfile = controller.agentNames.alias;
      controller.setAgentProfile();
      expect(controller.agentNamePreview).toEqual('careChatTpl.agentAliasPreview');
      controller.selectedAgentProfile = controller.agentNames.realName;
      controller.setAgentProfile();
      expect(controller.agentNamePreview).toEqual('careChatTpl.agentNamePreview');
    });

    it('should set template profile to org profile if org profile is selected when nextBtn is clicked', function () {
      resolveLogoPromise();
      controller.selectedTemplateProfile = controller.profiles.org;
      controller.nextButton();
      expect(controller.template.configuration.mediaSpecificConfiguration).toEqual({
        useOrgProfile: true,
        displayText: OrgName,
        image: ''
      });
    });

    it('should set template profile to agent profile if agent profile is selected when nextBtn is clicked', function () {
      resolveLogoPromise();
      controller.selectedTemplateProfile = controller.profiles.agent;
      controller.nextButton();
      expect(controller.template.configuration.mediaSpecificConfiguration).toEqual({
        useOrgProfile: false,
        useAgentRealName: false
      });
    });

    it('logoUploaded should be falsy when org admin did not upload a logo', function () {
      rejectLogoPromise();
      expect(controller.logoFile).toEqual('');
      expect(controller.logoUploaded).toBeFalsy();
    });
  });

  describe('Overview Page', function () {
    beforeEach(inject(intializeCtrl));
    beforeEach(function () {
      resolveLogoPromise();
    });
    it("should have previous and next button enabled", function () {
      checkStateOfNavigationButtons(OVERVIEW_PAGE_INDEX, true, true);
    });

    it("should initialize all cards as enabled ", function () {
      expect(controller.template.configuration.pages.customerInformation.enabled).toBe(true);
      expect(controller.template.configuration.pages.agentUnavailable.enabled).toBe(true);
      expect(controller.template.configuration.pages.offHours.enabled).toBe(true);
      expect(controller.template.configuration.pages.feedback.enabled).toBe(true);
    });
  });

  describe('Customer Info Page', function () {

    beforeEach(inject(intializeCtrl));
    beforeEach(function () {
      resolveLogoPromise();
    });

    it("should set the active item", function () {
      var returnObj = {
        attributes: [{
          name: 'header',
          value: 'careChatTpl.defaultWelcomeText'
        }, {
          name: 'organization',
          value: OrgName
        }]
      };
      controller.setActiveItem("welcomeHeader");
      expect(controller.activeItem).toEqual(returnObj);
    });

    it("should not get the attribute param for incorrect param", function () {
      var attrParam = controller.getAttributeParam("displaytext", "organization", "welcomeHeader");
      expect(attrParam).toBe(undefined);
    });

    it("should not get the attribute param for incorrect attribute", function () {
      var attrParam = controller.getAttributeParam("label", "displaytext", "welcomeHeader");
      expect(attrParam).toBe(undefined);
    });

    it("should not get the attribute param for incorrect field", function () {
      var attrParam = controller.getAttributeParam("label", "organization", "field");
      expect(attrParam).toBe(undefined);
    });

    it("should not get the attribute param for undefined field", function () {
      var attrParam = controller.getAttributeParam("label", "organization", undefined);
      expect(attrParam).toBe(undefined);
    });

    it("should be true for dynamic field", function () {
      var isDynamicRes = controller.isDynamicFieldType("field1");
      expect(isDynamicRes).toBe(true);
    });

    it("should be false for static field", function () {
      var isDynamicRes = controller.isDynamicFieldType("welcome");
      expect(isDynamicRes).toBe(false);
    });

    it("should be true for static field", function () {
      var isStaticRes = controller.isStaticFieldType("welcome");
      expect(isStaticRes).toBe(true);
    });

    it("should be false for dynamic field", function () {
      var isStaticRes = controller.isStaticFieldType("field1");
      expect(isStaticRes).toBe(false);
    });

    it("should be false for undefined field", function () {
      var isDynamicRes = controller.isDynamicFieldType(undefined);
      expect(isDynamicRes).toBe(false);
      var isStaticRes = controller.isStaticFieldType(undefined);
      expect(isStaticRes).toBe(false);
    });

    it("should be true for defined object field", function () {
      var testObj = {
        "trees-14": "x-10000",
        "trees-15": "x-20000",
        "trees-16": "x-30000"
      };
      var isDefinedRes = controller.isDefined(testObj, "trees-15");
      expect(isDefinedRes).toBe(true);
    });

    it("should be false for undefined object or field", function () {
      var testObj = {
        "trees-14": "x-10000",
        "trees-15": "x-20000",
        "trees-16": ""
      };
      var isDefinedRes = controller.isDefined(testObj, "trees-17");
      expect(isDefinedRes).toBe(false);
      isDefinedRes = controller.isDefined(testObj, "trees-16");
      expect(isDefinedRes).toBe(false);
    });

    it("should add a new category token and clear the input field when a new token is added", function () {
      var ENTER_KEYPRESS_EVENT = {
        which: 13
      };
      controller.categoryOptionTag = 'Mock Category Token';
      var mockElementObject = jasmine.createSpyObj('element', ['tokenfield']);
      spyOn(angular, 'element').and.returnValue(mockElementObject);
      spyOn(controller, 'addCategoryOption').and.callThrough();

      controller.onEnterKey(ENTER_KEYPRESS_EVENT);

      expect(controller.addCategoryOption).toHaveBeenCalled();
      expect(mockElementObject.tokenfield).toHaveBeenCalledWith('createToken', 'Mock Category Token');
      expect(controller.categoryOptionTag).toEqual('');
    });
  });

  describe('Off Hours Page', function () {
    beforeEach(inject(intializeCtrl));
    beforeEach(function () {
      controller.currentState = controller.states[6]; // set to off hours view
      resolveLogoPromise();
    });
    it('should set off hours message and business hours by default', function () {
      expect(controller.template.configuration.pages.offHours.message).toEqual('careChatTpl.offHoursDefaultMessage');
      expect(controller.open24Hours).toBe(true);
      expect(controller.isOffHoursMessageValid).toBe(true);
      expect(controller.isBusinessHoursDisabled).toBe(false);
      expect(_.map(_.filter(controller.days, 'isSelected'), 'label')).toEqual(selectedDaysByDefault);
      expect(_.map(controller.timings, 'value')).toEqual(['08:00', '16:00']);
      expect(controller.scheduleTimeZone).toEqual(defaultTimeZone);
      expect(controller.daysPreview).toEqual(defaultDayPreview);
    });

    it('should set days', function () {
      deSelectAllDays();
      expect(controller.isBusinessHoursDisabled).toBe(true);
      expect(_.map(_.filter(controller.days, 'isSelected'), 'label')).toEqual([]);
      controller.setDay(1); // set Monday
      controller.setDay(6); // set Saturday
      expect(_.map(_.filter(controller.days, 'isSelected'), 'label')).toEqual(['Monday', 'Saturday']);
      expect(controller.daysPreview).toEqual('Monday, Saturday');
    });

    it('should disable the right btn if no days are selected', function () {
      deSelectAllDays();
      expect(controller.nextButton()).toBe(undefined);
    });

    it('should disable the right btn if off hours message is empty', function () {
      controller.template.configuration.pages.offHours.message = '';
      expect(controller.nextButton()).toBe(false);
    });

  });

  describe('Summary Page', function () {
    var deferred;
    beforeEach(inject(intializeCtrl));
    beforeEach(function () {
      deferred = $q.defer();
      spyOn(SunlightConfigService, 'createChatTemplate').and.returnValue(deferred.promise);
    });

    it("When save chat template failed, the 'saveCTErrorOccurred' is set", function () {
      //by default, this flag is false
      expect(controller.saveCTErrorOccurred).toBeFalsy();
      deferred.reject(failedData);
      controller.submitChatTemplate();
      $scope.$apply();

      expect(controller.saveCTErrorOccurred).toBeTruthy();
    });

    it("should submit chat template successfully", function () {
      //by default, this flag is false
      expect(controller.saveCTErrorOccurred).toBeFalsy();

      spyOn($state, 'go');
      deferred.resolve({
        success: true,
        headers: function (header) {
          return 'something/abc123';
        },
        status: 201
      });

      controller.submitChatTemplate();
      $scope.$apply();

      expect($modal.open).toHaveBeenCalledWith({
        templateUrl: 'modules/sunlight/features/chat/ctEmbedCodeModal.tpl.html',
        size: 'lg',
        controller: 'EmbedCodeCtrl',
        controllerAs: 'embedCodeCtrl',
        resolve: {
          templateId: jasmine.any(Function)
        }
      });
      expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
        featureName: jasmine.any(String)
      });
      expect(controller.saveCTErrorOccurred).toBeFalsy();
      expect($state.go).toHaveBeenCalled();
    });
  });

  describe('Chat Status Messages Page', function () {
    beforeEach(inject(intializeCtrl));
    beforeEach(function () {
      resolveLogoPromise();
    });
    it("should have previous and next button enabled", function () {
      checkStateOfNavigationButtons(CHAT_STATUS_MESSAGES_PAGE_INDEX, true, true);
    });
  });
});
