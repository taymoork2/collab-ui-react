'use strict';

describe('Care Chat Setup Assistant Ctrl', function () {

  var controller, $modal, $timeout, $scope;

  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($rootScope, _$modal_, _$timeout_, $controller) {
    $scope = $rootScope.$new();
    $modal = _$modal_;
    $timeout = _$timeout_;

    controller = $controller('CareChatSetupAssistantCtrl', {
      $scope: $scope
    });

    spyOn($modal, 'open');
  }));

  function checkStateOfButton(pageIndex, previousButtonState, nextButtonState) {
    expect(controller.previousButton(pageIndex)).toEqual(previousButtonState);
    expect(controller.nextButton(pageIndex)).toEqual(nextButtonState);
  }

  function validateKeyPressEvent(eventKey, currentPageIndex, expectedPageIndex) {
    controller.pageIndex = currentPageIndex;
    controller.evalKeyPress(eventKey);
    $timeout.flush();
    expect(controller.pageIndex).toEqual(expectedPageIndex);
  }

  it("should test that the page index starts at 0", function () {
    controller.pageIndex = 0;
    expect(controller.getPageIndex()).toEqual(0);
  });

  it("should hide previous button on first page", function () {
    checkStateOfButton(0, 'hidden', true);
  });

  it("should hide next button on last page", function () {
    checkStateOfButton(8, true, 'hidden');
  });

  it("should test the right arrow on the first page", function () {
    validateKeyPressEvent($scope.rightArrow, 0, 1);
  });

  it("should test the left arrow when on the first page", function () {
    validateKeyPressEvent($scope.leftArrow, 0, 0);
  });

  it("should test the left arrow when not on the first page", function () {
    validateKeyPressEvent($scope.leftArrow, 1, 0);
  });

  it("should test the right arrow when on the last page", function () {
    validateKeyPressEvent($scope.rightArrow, 8, 8);
  });

  it("should test the escape key", function () {
    controller.evalKeyPress($scope.escapeKey);
    expect($modal.open).toHaveBeenCalled();
  });
});
