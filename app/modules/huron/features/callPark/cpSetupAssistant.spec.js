'use strict';

describe('Huron Call Park Setup Assistant Ctrl', function () {

  var controller, $scope, $modal, $timeout, Notification, CallParkService, $q, $state;

  var leftArrow = 37;
  var rightArrow = 39;
  var escapeKey = 27;
  var testGroupName = 'test';
  var testGroupMember = 'testUser';

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$modal_, _$timeout_, _Notification_, _CallParkService_, _$q_, _$state_) {
    $scope = $rootScope.$new();
    $modal = _$modal_;
    $timeout = _$timeout_;
    Notification = _Notification_;
    CallParkService = _CallParkService_;
    $q = _$q_;
    $state = _$state_;

    controller = $controller('CallParkSetupAssistantCtrl', {
      $scope: $scope,
      $modal: $modal,
      Notification: Notification,
      CallParkService: CallParkService,
      $state: $state
    });
    var emptyForm = function () {
      return true;
    };

    var form = {
      '$invalid': false,
      $setDirty: emptyForm,
      $setPristine: emptyForm,
      $setUntouched: emptyForm
    };
    controller.form = form;

    spyOn($modal, 'open');
    spyOn($state, 'go');
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(CallParkService, 'saveCallPark').and.returnValue($q.when());
  }));

  it("should test that the page index starts at 0", function () {
    controller.pageIndex = 0;
    expect(controller.getPageIndex()).toEqual(0);
  });

  it("should enable next button when not null on first page", function () {
    expect(controller.nextButton(0)).toEqual(false);
    controller.callParkName = testGroupName;
    expect(controller.nextButton(0)).toEqual(true);
  });

  it("on changing radio selection to an option with invalid fields the form becomes invalid and disables the next button", function () {
    controller.cpNumberOptions[0].currentInput = 0;
    controller.cpNumberOptions[0].inputs[0].range_1.value = '6000';
    controller.cpNumberOptions[0].inputs[0].range_2.value = '6010';
    controller.cpNumberOptions[0].inputs[1].value = '';
    $scope.$apply();
    expect(controller.nextButton(1)).toEqual(true);
    controller.cpNumberOptions[0].currentInput = 1;
    $scope.$apply();
    expect(controller.nextButton(1)).toEqual(false);
  });

  it("should hide the next button on the last page", function () {
    expect(controller.nextButton(2)).toEqual(false);
    controller.selectedMembers.push(testGroupMember);
    expect(controller.nextButton(2)).toEqual(true);
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
    controller.callParkName = testGroupName;
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
