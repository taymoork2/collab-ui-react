'use strict';

describe('Controller: HuntGroupSetupAssistantCtrl - Hunt Pilot Number Lookup', function () {

  var $httpBackend, controller, $scope, HuntGroupService, Notification;

  var someNumber = {
    "type": "INTERNAL",
    "uuid": "167da8d1-0711-4155-832b-0172ba48e1af",
    "number": "2101",
    "assigned": false
  };

  var anotherNumber = {
    "type": "INTERNAL",
    "uuid": "973d465a-cf96-47a1-beb8-500eccfeb4ef",
    "number": "2102",
    "assigned": false
  };

  var successResponse = {
    "numbers": [someNumber, anotherNumber]
  };

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  var NumberLookupUrl = new RegExp(".*/customers/1/numbers.*");

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_,
    _HuntGroupService_, _Notification_) {
    $scope = $rootScope.$new();
    HuntGroupService = _HuntGroupService_;
    Notification = _Notification_;
    $httpBackend = _$httpBackend_;

    controller = $controller('HuntGroupSetupAssistantCtrl', {
      $scope: $scope,
      HuntGroupService: HuntGroupService,
      Notification: Notification
    });

  }));

  it("notifies with error response when number fetch fails.", function () {
    spyOn(Notification, 'errorResponse');
    $httpBackend.expectGET(NumberLookupUrl).respond(500);
    controller.fetchNumbers("123").then(function () {
      expect(Notification.errorResponse).toHaveBeenCalledWith(jasmine.anything(),
        'huronHuntGroup.numberFetchFailure');
    });
    $httpBackend.flush();
  });

  it("on selecting a pilot number, the selectedPilotNumbers list is updated.", function () {
    controller.selectPilotNumber(someNumber);
    expect(listContains(controller.selectedPilotNumbers, someNumber)).toBeTruthy();
  });

  it("filters the selected numbers from showing in the drop down.", function () {
    // UI selected a number pill.
    controller.selectPilotNumber(someNumber);

    // Backend returns a list.
    $httpBackend.expectGET(NumberLookupUrl).respond(200, successResponse);

    // UI must filter and show only the list that is not already selected.
    controller.fetchNumbers(someNumber.number).then(function (dropdownList) {
      expect(listContains(dropdownList, someNumber)).toBeFalsy();
    });
    $httpBackend.flush();
  });

  it("on closing a pill, the list is updated and drop down starts showing the closed pill.", function () {

    controller.selectPilotNumber(someNumber); // pill 1 selected.
    controller.selectPilotNumber(anotherNumber); // pill 2 selected.

    // Backend returns a list.
    $httpBackend.expectGET(NumberLookupUrl).respond(200, successResponse);

    // UI types in number of pill 1
    controller.fetchNumbers(someNumber.number).then(function (dropdownList) {
      expect(listContains(dropdownList, someNumber)).toBeFalsy(); // drop down must not show it.
    });
    $httpBackend.flush();

    controller.unSelectPilotNumber(someNumber); // pill 1 is closed.

    // Backend returns a list.
    $httpBackend.expectGET(NumberLookupUrl).respond(200, successResponse);

    // UI types in number of pill 1
    controller.fetchNumbers(someNumber.number).then(function (dropdownList) {
      expect(listContains(dropdownList, someNumber)).toBeTruthy(); // drop down must show it.
    });

    $httpBackend.flush();
  });

  function listContains(dropdownList, number) {
    return (dropdownList.filter(function (elem) {
      return (elem.uuid == number.uuid);
    })).length > 0;
  }

  it("calls the backend only after 3 key strokes.", function () {
    $httpBackend.expectGET(NumberLookupUrl).respond(200, successResponse);
    controller.fetchNumbers("1");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // Not request made.

    controller.fetchNumbers("12");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // Not request made.

    controller.fetchNumbers("123");
    $httpBackend.flush(); // Request made.
  });

  it("shows primary indicator when input typed is less than 3", function () {
    controller.fetchNumbers("1");
    expect(controller.errorNumberInput).toBeFalsy();
    $scope.$apply();

    controller.fetchNumbers("12");
    expect(controller.errorNumberInput).toBeFalsy();
    $scope.$apply();
  });

  it("shows danger indicator when input typed is >= 3 and no valid suggestions.", function () {
    var noSuggestion = {
      "numbers": []
    };
    $httpBackend.expectGET(NumberLookupUrl).respond(200, noSuggestion);
    controller.fetchNumbers("123");
    $scope.$apply();
    $httpBackend.flush(); // Request made.
    expect(controller.errorNumberInput).toBeTruthy();

    $httpBackend.expectGET(NumberLookupUrl).respond(200, successResponse);
    controller.fetchNumbers("123");
    $scope.$apply();
    $httpBackend.flush(); // Request made.
    expect(controller.errorNumberInput).toBeFalsy();
  });
});
