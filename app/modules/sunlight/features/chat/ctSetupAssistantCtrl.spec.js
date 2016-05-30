'use strict';

describe('Care Chat Setup Assistant Ctrl', function () {

  var controller, $scope, $modal, $q, $timeout, $window, Authinfo, CTService, getLogoDeferred;

  var escapeKey = 27;
  var templateName = 'Atlas UT Chat Template';
  var NAME_PAGE_INDEX = 0;
  var PROFILE_PAGE_INDEX = 1;
  var OVERVIEW_PAGE_INDEX = 2;
  var CUSTOMER_PAGE_INDEX = 3;
  var FEEDBACK_PAGE_INDEX = 4;
  var AGENT_UNAVAILABLE_PAGE_INDEX = 5;
  var OFF_HOURS_PAGE_INDEX = 6;
  var CHAT_STRING_PAGE_INDEX = 7;
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

  beforeEach(module('Sunlight'));
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  var intializeCtrl = function (_$rootScope_, $controller, _$modal_, _$q_, _$timeout_, _$window_, _Authinfo_, _CTService_) {
    $scope = _$rootScope_.$new();
    $modal = _$modal_;
    $q = _$q_;
    $timeout = _$timeout_;
    $window = _$window_;
    Authinfo = _Authinfo_;
    CTService = _CTService_;

    //create mock deferred object which will be used to return promises
    getLogoDeferred = $q.defer();
    spyOn($modal, 'open');
    spyOn(CTService, 'getLogo').and.returnValue(getLogoDeferred.promise);

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
          value: 'careChatTpl.defaultOrgText'
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
  });
});
