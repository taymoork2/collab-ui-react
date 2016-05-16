'use strict';

describe('Care Chat Setup Assistant Ctrl', function () {

  var controller, $modal, $timeout;

  var escapeKey = 27;
  var leftArrow = 37;
  var rightArrow = 39;
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

  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_$modal_, _$timeout_, $controller) {
    $modal = _$modal_;
    $timeout = _$timeout_;

    controller = $controller('CareChatSetupAssistantCtrl');

    spyOn($modal, 'open');
  }));

  function checkStateOfNavigationButtons(pageIndex, previousButtonState, nextButtonState) {
    controller.currentState = controller.states[pageIndex];
    expect(controller.previousButton(pageIndex)).toEqual(previousButtonState);
    expect(controller.nextButton(pageIndex)).toEqual(nextButtonState);
  }

  function validateKeyPressEvent(eventKey, currentPageIndex, expectedPageIndex) {
    controller.currentState = controller.states[currentPageIndex];
    controller.evalKeyPress(eventKey);
    $timeout.flush();
    expect(controller.currentState).toEqual(controller.states[expectedPageIndex]);
  }

  it("should test that the page index starts at 0", function () {
    controller.currentState = controller.states[NAME_PAGE_INDEX];
    expect(controller.getPageIndex()).toEqual(NAME_PAGE_INDEX);
  });

  it("should hide previous button on first page", function () {
    checkStateOfNavigationButtons(NAME_PAGE_INDEX, 'hidden', false);
  });

  it("should hide next button on last page", function () {
    checkStateOfNavigationButtons(EMBED_CODE_PAGE_INDEX, true, 'hidden');
  });

  it("next button should be enabled when name is present", function () {
    controller.template.name = templateName;
    checkStateOfNavigationButtons(NAME_PAGE_INDEX, 'hidden', true);
    validateKeyPressEvent(rightArrow, NAME_PAGE_INDEX, PROFILE_PAGE_INDEX);
  });

  it("next button should be disabled when name is not present", function () {
    controller.template.name = '';
    checkStateOfNavigationButtons(NAME_PAGE_INDEX, 'hidden', false);
  });

  it("should test the left arrow when on the first page", function () {
    validateKeyPressEvent(leftArrow, NAME_PAGE_INDEX, NAME_PAGE_INDEX);
  });

  it("should test the left arrow when not on the first page", function () {
    validateKeyPressEvent(leftArrow, PROFILE_PAGE_INDEX, NAME_PAGE_INDEX);
  });

  it("should test the right arrow when on the last page", function () {
    validateKeyPressEvent(rightArrow, EMBED_CODE_PAGE_INDEX, EMBED_CODE_PAGE_INDEX);
  });

  it("should test the escape key", function () {
    controller.evalKeyPress(escapeKey);
    expect($modal.open).toHaveBeenCalled();
  });

  describe('Chat Template - Overview Page', function () {

    it("should have previous and next button enabled", function () {
      checkStateOfNavigationButtons(OVERVIEW_PAGE_INDEX, true, true);
      validateKeyPressEvent(rightArrow, OVERVIEW_PAGE_INDEX, CUSTOMER_PAGE_INDEX);
      validateKeyPressEvent(leftArrow, OVERVIEW_PAGE_INDEX, PROFILE_PAGE_INDEX);
    });

    it("should initialize all cards as enabled ", function () {
      expect(controller.template.configuration.pages.customerInformation.enabled).toBe(true);
      expect(controller.template.configuration.pages.agentUnavailable.enabled).toBe(true);
      expect(controller.template.configuration.pages.offHours.enabled).toBe(true);
      expect(controller.template.configuration.pages.feedback.enabled).toBe(true);
    });
  });
});
