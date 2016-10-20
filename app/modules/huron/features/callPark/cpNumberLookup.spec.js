'use strict';

describe('Controller: CallParkSetupAssistantCtrl - Call Park Number Lookup', function () {

  var $httpBackend, controller, $scope, CallParkService, Notification;

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
    _CallParkService_, _Notification_) {
    $scope = $rootScope.$new();
    CallParkService = _CallParkService_;
    Notification = _Notification_;
    $httpBackend = _$httpBackend_;

    controller = $controller('CallParkSetupAssistantCtrl', {
      $scope: $scope,
      CallParkService: CallParkService,
      Notification: Notification
    });

  }));

  it("notifies with error response when number fetch fails.", function () {
    spyOn(Notification, 'errorResponse');
    $httpBackend.expectGET(NumberLookupUrl).respond(500);
    controller.fetchNumbers("123").then(function () {
      expect(Notification.errorResponse).toHaveBeenCalledWith(jasmine.anything(),
        'callPark.numberFetchFailure');
    });
    $httpBackend.flush();
  });

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
