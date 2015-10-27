'use strict';

describe('Controller: HuntGroupSetupAssistantCtrl', function () {

  var FakeNumberSearchServiceV2, FakeApi, controller, $scope, HuntGroupService, Notification;
  var someNumber = {
    number: 1234
  };
  var anotherNumber = {
    number: 4321
  };
  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, $q, $state, _HuntGroupService_, _Notification_) {
    $scope = $rootScope.$new();
    HuntGroupService = _HuntGroupService_;
    Notification = _Notification_;

    FakeApi = $q.defer();
    FakeNumberSearchServiceV2 = {
      get: function () {
        return {
          $promise: FakeApi.promise
        };
      }
    };

    controller = $controller('HuntGroupSetupAssistantCtrl', {
      $scope: $scope,
      HuntGroupService: HuntGroupService,
      Notification: Notification,
      NumberSearchServiceV2: FakeNumberSearchServiceV2
    });
  }));

  it("notifies with error response when number fetch fails.", function () {
    spyOn(Notification, 'errorResponse');
    FakeApi.reject('Some Error');
    controller.fetchNumbers(someNumber.number).then(function () {
      expect(Notification.errorResponse).toHaveBeenCalled('Some Error',
        'huntGroup.numberFetchFailure');
    });
  });

  it("on selecting a pilot number, the selectedPilotNumbers list is updated.", function () {
    controller.selectPilotNumber(someNumber);
    var numbers = controller.selectedPilotNumbers.map(function (e) {
      return e.number;
    });
    expect(numbers.indexOf(someNumber.number)).not.toBe(-1);
  });

  it("filters the selected numbers from showing in the drop down.", function () {
    // UI selected a number pill.
    controller.selectPilotNumber(someNumber);

    // Backend returns a list.
    FakeApi.resolve({
      numbers: [
        someNumber,
        anotherNumber
      ]
    });

    // UI must filter and show only the list that is not already selected.
    controller.fetchNumbers(someNumber.number).then(function (dropdownList) {
      expect(dropdownList.indexOf(someNumber)).toBe(-1);
    });
  });

  it("on closing a pill, the list is updated and drop down starts showing the closed pill.", function () {
    // UI selects and Un-Selects number pills.
    controller.selectPilotNumber(someNumber);
    controller.selectPilotNumber(anotherNumber);
    controller.unSelectPilotNumber(someNumber.number);

    // Backend returns a list.
    FakeApi.resolve({
      numbers: [
        someNumber,
        anotherNumber
      ]
    });

    // UI must show and filter the correct items in the dropdown.
    controller.fetchNumbers(someNumber.number).then(function (dropdownList) {
      expect(dropdownList.indexOf(someNumber)).not.toBe(-1);
      expect(dropdownList.indexOf(anotherNumber)).toBe(-1);
    });
  });

  it("calls the backend only after 3 key strokes.", function () {
    spyOn(FakeNumberSearchServiceV2, 'get');
    controller.fetchNumbers(1).then(function () {
      expect(FakeNumberSearchServiceV2.get).not.toHaveBeenCalled();
    });
    controller.fetchNumbers(12).then(function () {
      expect(FakeNumberSearchServiceV2.get).not.toHaveBeenCalled();
    });
    controller.fetchNumbers(123).then(function () {
      expect(FakeNumberSearchServiceV2.get).toHaveBeenCalled();
    });
  });

  it("formats the number based on US region code.", function () {
    FakeApi.resolve({
      numbers: [{
        "number": "+19724052108"
      }]
    });

    controller.fetchNumbers(108).then(function (dropdownList) {
      expect(dropdownList(0)).toBe("(972) 405-2108");
    });
  });

});
