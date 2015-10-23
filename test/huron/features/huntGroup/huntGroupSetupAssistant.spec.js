'use strict';

describe('Huron Setup Assistant Ctrl', function () {

  var controller, $scope, $modal, $timeout;

  var leftArrow = 37;
  var rightArrow = 39;
  var escapeKey = 27;
  var testGroupName = 'test';
  var testGroupNumber = '654-654-9874';
  var testGroupUser = 'testUser';

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$modal_, _$timeout_) {
    $scope = $rootScope.$new();
    $modal = _$modal_;
    $timeout = _$timeout_;

    controller = $controller('HuntGroupSetupAssistantCtrl', {
      $scope: $scope,
      $modal: $modal
    });

    spyOn($modal, 'open');
  }));

  it("should test that the page index starts at 0", function () {
    controller.pageIndex = 0;
    expect(controller.getPageIndex()).toEqual(0);
  });

  it("should enable next button when not null on first page", function () {
    expect(controller.nextButton(0)).toEqual(false);
    controller.huntGroupName = testGroupName;
    expect(controller.nextButton(0)).toEqual(true);
  });

  it("should enable next button when not null on second pagee", function () {
    expect(controller.nextButton(1)).toEqual(false);
    controller.selectedPilotNumbers.push(testGroupNumber);
    expect(controller.nextButton(1)).toEqual(true);
  });

  it("should enable next button when not null on third page", function () {
    expect(controller.nextButton(2)).toEqual(false);
    controller.huntGroupMethod = controller.hgMethods.longestIdle;
    expect(controller.nextButton(2)).toEqual(true);
  });

  it("should enable next button when not null on fourth page", function () {
    expect(controller.nextButton(3)).toEqual(false);
    controller.users.push(testGroupUser);
    expect(controller.nextButton(3)).toEqual(true);
  });

  it("should hide the next button on the last page", function () {
    expect(controller.nextButton(4)).toEqual('hidden');
  });

  it("should hide the previous button on the first page", function () {
    expect(controller.previousButton(0)).toEqual('hidden');
  });

  it("should test the right arrow when input is null", function () {
    controller.pageIndex = 0;
    controller.evalKeyPress(rightArrow);
    $timeout.flush();
    expect(controller.pageIndex).toEqual(0);
  });

  it("should test the right arrow when input is not null", function () {
    controller.pageIndex = 0;
    controller.huntGroupName = testGroupName;
    controller.evalKeyPress(rightArrow);
    $timeout.flush();
    expect(controller.pageIndex).toEqual(1);
  });

  it("should test the left arrow when on the first page", function () {
    controller.pageIndex = 0;
    controller.evalKeyPress(leftArrow);
    $timeout.flush();
    expect(controller.pageIndex).toEqual(0);
  });

  it("should test the left arrow when not on the first page", function () {
    controller.pageIndex = 1;
    controller.evalKeyPress(leftArrow);
    $timeout.flush();
    expect(controller.pageIndex).toEqual(0);
  });

  it("should test the escape key", function () {
    controller.evalKeyPress(escapeKey);
    expect($modal.open).toHaveBeenCalled();
  });
});
