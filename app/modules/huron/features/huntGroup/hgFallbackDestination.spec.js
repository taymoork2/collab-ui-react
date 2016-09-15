'use strict';

describe('Controller: HuntGroupSetupAssistantCtrl - Fallback Destination', function () {

  var $httpBackend, $scope, $state, controller, Notification, $q, HuntGroupFallbackDataService;

  var user1 = getJSONFixture('huron/json/features/huntGroup/user1.json');
  var user2 = getJSONFixture('huron/json/features/huntGroup/user2.json');

  var huntPilotNumber1 = {
    "type": "INTERNAL",
    "uuid": "167da8d1-0711-4155-832b-0172ba48e1af",
    "number": "2101",
    "assigned": false
  };

  var huntPilotNumber2 = {
    "type": "INTERNAL",
    "uuid": "973d465a-cf96-47a1-beb8-500eccfeb4ef",
    "number": "2102",
    "assigned": false
  };

  var huntGroupMember1 = {
    uuid: user1.uuid,
    displayUser: true,
    user: user1,
    selectableNumber: user1.numbers[0]
  };

  var fallbackMember1 = {
    uuid: user2.uuid,
    displayUser: true,
    user: user2,
    selectableNumber: user2.numbers[0]
  };

  var successResponse = {
    "users": [user1, user2]
  };

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var MemberLookupUrl = new RegExp(".*/api/v2/customers/1/users.*");
  var GetNumberUrl = new RegExp(".*/api/v2/customers/1/numbers.*");
  var GetMemberUrl = new RegExp(".*/api/v2/customers/1/users/.*");
  var SaveHuntGroupUrl = new RegExp(".*/api/v2/customers/1/features/huntgroups.*");

  beforeEach(angular.mock.module('Huron'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$httpBackend_, _Notification_, _$q_, _HuntGroupFallbackDataService_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;
    $q = _$q_;
    HuntGroupFallbackDataService = _HuntGroupFallbackDataService_;

    controller = $controller('HuntGroupSetupAssistantCtrl', {
      $scope: $scope,
      $state: $state,
      Notification: Notification
    });

    spyOn(HuntGroupFallbackDataService, 'isVoicemailDisabled').and.returnValue($q.defer().promise);

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it("notifies with error response when member fetch fails for fallback.", function () {
    spyOn(Notification, 'errorResponse');
    $httpBackend.expectGET(MemberLookupUrl).respond(500);
    controller.fetchFallbackDestination("sun").then(function () {
      expect(Notification.errorResponse).toHaveBeenCalledWith(jasmine.anything(),
        'huronHuntGroup.memberFetchFailure');
    });
    $httpBackend.flush();
  });

  it("calls the backend only after 3 key strokes.", function () {
    $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);
    controller.fetchFallbackDestination("s");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // No request made.

    controller.fetchFallbackDestination("su");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // No request made.

    controller.fetchFallbackDestination("sun");
    $httpBackend.flush(); // Request made.
  });

  it("should invalidate the fallback number if entered invalid", function () {
    controller.selectedFallbackNumber = "8";
    controller.validateFallbackNumber();
    $scope.$apply();

    expect(controller.isFallbackValid()).toBeFalsy();
  });

  it("should validate the external fallback number (without country code) correctly.", function () {
    controller.selectedFallbackNumber = "8179325798";
    controller.validateFallbackNumber();
    $scope.$apply();

    expect(controller.isFallbackValid()).toBeTruthy();
    expect(controller.selectedFallbackNumber).toEqual("(817) 932-5798");
  });

  it("should validate the external fallback number (with country code) correctly.", function () {
    controller.selectedFallbackNumber = "+18179325798";
    controller.validateFallbackNumber();
    $scope.$apply();

    expect(controller.isFallbackValid()).toBeTruthy();
    expect(controller.selectedFallbackNumber).toEqual("(817) 932-5798");
  });

  it("internal number absolute match works fine with 1 record backend response.", function () {
    var number = {
      "uuid": "167da8d1-0711-4155-832b-0172ba48e1af",
      "number": "80632101"
    };

    expectFallbackNumberSuggestion("2101", [number]); // backend suggests partial match
    $scope.$apply();

    expect(controller.isFallbackValid()).toBeFalsy();
    expect(controller.selectedFallbackNumber).toEqual("2101");
  });

  it("internal number absolute match works fine with >1 record backend response.", function () {
    var number1 = {
      "uuid": "167da8d1-0711-4155-832b-0172ba48e1af",
      "number": "80632101"
    };
    var number2 = {
      "uuid": "167da8d1-0711-4155-832b-0172ba48e1af",
      "number": "8063"
    };

    expectFallbackNumberSuggestion("8063", [number1, number2]); // back suggests > 1 match
    $scope.$apply();

    expect(controller.isFallbackValid()).toBeTruthy();
    expect(controller.selectedFallbackNumber).toEqual("8063");
  });

  it("internal number absolute continues to works if admin decides to change a earlier matched number.", function () {
    var number1 = {
      "uuid": "167da8d1-0711-4155-832b-0172ba48e1af",
      "number": "80632101"
    };

    expectFallbackNumberSuggestion("80632101", [number1]);
    $scope.$apply();
    expect(controller.isFallbackValid()).toBeTruthy();
    expect(controller.selectedFallbackNumber).toEqual("80632101");

    expectFallbackNumberSuggestion("8063210", [number1]); // enters a backspace
    $scope.$apply();
    expect(controller.isFallbackValid()).toBeFalsy();
    expect(controller.selectedFallbackNumber).toEqual("8063210");

    expectFallbackNumberSuggestion("80632101", [number1]);
    $scope.$apply();
    expect(controller.isFallbackValid()).toBeTruthy();
    expect(controller.selectedFallbackNumber).toEqual("80632101");
  });

  it("selecting a fallback member initializes fallback data correctly.", function () {
    controller.selectedFallbackNumber = "80";
    controller.selectFallback(fallbackMember1);
    controller.validateFallbackNumber();

    expect(controller.selectedFallbackNumber).toBeUndefined();
    expect(controller.isFallbackValid()).toBeTruthy();
    expect(controller.selectedFallbackMember).not.toBeUndefined();
  });

  it("should have the openPanel flag for fallback member and toggleFallback works.", function () {
    var member1 = angular.copy(huntGroupMember1);
    controller.selectFallback(member1);
    expect(controller.selectedFallbackMember.openPanel).toBeFalsy();
    expect(controller.selectedFallbackMember.member.user.email).toBeUndefined();

    $httpBackend.expectGET(GetMemberUrl).respond(200, {
      email: "test@cisco.com"
    });
    controller.toggleFallback();
    $httpBackend.flush();

    expect(controller.selectedFallbackMember.openPanel).toBeTruthy();
    expect(controller.selectedFallbackMember.member.user.email).toBe("test@cisco.com");
  });

  it("removing fallback member resets the member to undefined.", function () {
    controller.selectFallback(fallbackMember1);
    expect(controller.selectedFallbackMember).not.toBeUndefined();

    controller.removeFallbackDest();
    expect(controller.selectedFallbackMember).toBeUndefined();
  });

  it("should be able to create Hunt Group with fallback number", function () {
    controller.selectedFallbackNumber = "8179325798";
    controller.validateFallbackNumber();
    $scope.$apply();

    spyOn($state, 'go');
    spyOn(Notification, 'success');

    $httpBackend.expectPOST(SaveHuntGroupUrl).respond(200, "Some Response");
    controller.saveHuntGroup();
    $httpBackend.flush();

    expect(Notification.success).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('huronfeatures');
  });

  it("should be able to create Hunt Group with fallback member", function () {
    controller.selectFallback(fallbackMember1);

    spyOn($state, 'go');
    spyOn(Notification, 'success');
    $httpBackend.expectPOST(SaveHuntGroupUrl).respond(200, "Some Response");
    controller.saveHuntGroup();
    $httpBackend.flush();

    expect(Notification.success).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('huronfeatures');
  });

  it("should notify with an error when create hunt group fails", function () {
    controller.selectedFallbackNumber = "8179325798";
    controller.validateFallbackNumber();
    $scope.$apply();

    spyOn($state, 'go');
    spyOn(Notification, 'errorResponse');
    $httpBackend.expectPOST(SaveHuntGroupUrl).respond(400, "Some Response");
    controller.saveHuntGroup();
    $httpBackend.flush();

    expect(Notification.errorResponse).toHaveBeenCalled();
    expect($state.go).not.toHaveBeenCalled();
  });

  it("saveHuntGroup adds selected hunt pilot numbers correctly.", function () {
    var data = {
      name: "Test Hunt Group",
      huntMethod: controller.hgMethods.longestIdle
    };
    expect(data.numbers).toBeUndefined();

    controller.selectedPilotNumbers = [huntPilotNumber1, huntPilotNumber2];
    controller.populateHuntPilotNumbers(data);

    expect(data.numbers).not.toBeUndefined();
    expect(data.numbers.length).toBe(2);
  });

  it("saveHuntGroup adds selected hunt members correctly.", function () {
    var data = {
      name: "Test Hunt Group",
      huntMethod: controller.hgMethods.longestIdle
    };
    expect(data.members).toBeUndefined();

    controller.selectHuntGroupMember(huntGroupMember1);
    controller.populateHuntMembers(data);

    expect(data.members).not.toBeUndefined();
    expect(data.members.length).toBe(1);
  });

  it("saveHuntGroup adds selected fallback number correctly.", function () {
    var data = {
      name: "Test Hunt Group",
      huntMethod: controller.hgMethods.longestIdle
    };
    expect(data.fallbackDestination).toBeUndefined();

    controller.selectedFallbackNumber = "8179325798";
    controller.validateFallbackNumber();

    controller.populateFallbackDestination(data);

    expect(data.fallbackDestination).not.toBeUndefined();
    expect(data.fallbackDestination.number).toBe("+18179325798");
    expect(data.fallbackDestination.numberUuid).toBeUndefined();
    expect(data.fallbackDestination.sendToVoicemail).toBeUndefined();
  });

  it("saveHuntGroup adds selected fallback member correctly.", function () {
    var data = {
      name: "Test Hunt Group",
      huntMethod: controller.hgMethods.longestIdle
    };
    expect(data.fallbackDestination).toBeUndefined();

    controller.selectFallback(fallbackMember1);

    controller.populateFallbackDestination(data);

    expect(data.fallbackDestination).not.toBeUndefined();
    expect(data.fallbackDestination.number).toBeUndefined();
    expect(data.fallbackDestination.numberUuid).toBe(
      fallbackMember1.selectableNumber.uuid);
  });

  it("shows primary indicator when input typed is less than 3",
    function () {
      controller.fetchFallbackDestination("s");
      $scope.$apply();
      expect(controller.isErrorFallbackInput()).toBeFalsy();

      controller.fetchFallbackDestination("su");
      $scope.$apply();
      expect(controller.isErrorFallbackInput()).toBeFalsy();
    }
  );

  it("shows danger indicator when input typed is >= 3 and no valid suggestions.", function () {
    var noSuggestion = {
      "users": []
    };
    $httpBackend.expectGET(MemberLookupUrl).respond(200, noSuggestion);
    controller.fetchFallbackDestination("sun");
    $scope.$apply();
    $httpBackend.flush(); // Request made.
    expect(controller.isErrorFallbackInput()).toBeUndefined();

    $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);
    controller.fetchFallbackDestination("sun");
    $scope.$apply();
    $httpBackend.flush(); // Request made.
    expect(controller.isErrorFallbackInput()).toBeFalsy();
  });

  it("shows primary indicator when input typed is a valid external number.", function () {
    controller.selectedFallbackNumber = "8179325798";
    controller.validateFallbackNumber();
    $scope.$apply();

    expect(controller.isErrorFallbackInput()).toBeFalsy();
  });

  function expectFallbackNumberSuggestion(inNumber, outArray) {
    controller.selectedFallbackNumber = inNumber;
    $httpBackend.expectGET(GetNumberUrl).respond(200, {
      numbers: outArray
    });
    controller.validateFallbackNumber();
    $httpBackend.flush();
  }
});
