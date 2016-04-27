'use strict';

describe('Care Chat Setup Assistant Ctrl', function () {

  var controller, $modal, $timeout;

  var escapeKey = 27;
  var leftArrow = 37;
  var rightArrow = 39;
  var templateName = 'Atlas UT Chat Template';

  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_$modal_, _$timeout_, $controller) {
    $modal = _$modal_;
    $timeout = _$timeout_;

    controller = $controller('CareChatSetupAssistantCtrl');

    spyOn($modal, 'open');
  }));

  function checkStateOfButton(pageIndex, previousButtonState, nextButtonState) {
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
    controller.currentState = controller.states[0];
    expect(controller.getPageIndex()).toEqual(0);
  });

  it("should hide previous button on first page", function () {
    checkStateOfButton(0, 'hidden', false);
  });

  it("should hide next button on last page", function () {
    checkStateOfButton(8, true, 'hidden');
  });

  it("should test the right arrow when template name is not null on the first page", function () {
    controller.templateJson.name = templateName;
    checkStateOfButton(0, 'hidden', true);
    validateKeyPressEvent(rightArrow, 0, 1);
  });

  it("should disable next button when template name is null on first page", function () {
    controller.templateJson.name = '';
    checkStateOfButton(0, 'hidden', false);
  });

  it("should test the left arrow when on the first page", function () {
    validateKeyPressEvent(leftArrow, 0, 0);
  });

  it("should test the left arrow when not on the first page", function () {
    validateKeyPressEvent(leftArrow, 1, 0);
  });

  it("should test the right arrow when on the last page", function () {
    validateKeyPressEvent(rightArrow, 8, 8);
  });

  it("should test the escape key", function () {
    controller.evalKeyPress(escapeKey);
    expect($modal.open).toHaveBeenCalled();
  });
});
