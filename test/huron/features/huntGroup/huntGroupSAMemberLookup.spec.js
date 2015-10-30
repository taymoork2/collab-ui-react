'use strict';

describe('Controller: HuntGroupSetupAssistantCtrl - Hunt Member Lookup', function () {

  var $httpBackend, filter, controller, $scope, HuntGroupService, Notification;

  var user1 = {
    "email": "sumuthur@cisco.com",
    "uuid": "84cfdbb2-5eef-4c25-9f07-41729ce70e20",
    "numbers": [{
      "internal": "4001",
      "external": "972-510-4001",
      "uuid": "a8f8ee55-d670-4cb2-a73a-f31eacbe09f5"
    }, {
      "internal": "1236",
      "external": "",
      "uuid": "4b55a097-c117-42a0-b42f-ee7273b0895a"
    }],
    "lastName": "Muthuraj",
    "firstName": "Sundar Rajan",
    "userName": "sumuthur"
  };

  var user2 = {
    "email": "sjalipar@cisco.com",
    "uuid": "d1a3f4db-0ba1-4283-a30c-35d29942e086",
    "numbers": [{
      "internal": "4002",
      "external": "972-510-4002",
      "uuid": "99d11522-7459-4b06-bb1a-0904d2be0cd4"
    }, {
      "internal": "5002",
      "external": "",
      "uuid": "a80f3351-fb88-499f-bbc4-e6b42862509c"
    }],
    "lastName": "Jaliparthy",
    "firstName": "Sri Krishna",
    "userName": "sjalipar"
  };

  function listContains(someList, item) {
    return (someList.filter(function (elem) {
      return (elem.uuid == item.uuid);
    })).length > 0;
  }

  var successResponse = {
    "users": [user1, user2]
  };

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module('Huron'));
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  var MemberLookupUrl = new RegExp(".*/customers/1/users.*");

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _$filter_,
    _HuntGroupService_, _Notification_) {
    $scope = $rootScope.$new();
    HuntGroupService = _HuntGroupService_;
    Notification = _Notification_;
    $httpBackend = _$httpBackend_;
    filter = _$filter_('huntMemberTelephone');

    controller = $controller('HuntGroupSetupAssistantCtrl', {
      $scope: $scope,
      HuntGroupService: HuntGroupService,
      Notification: Notification
    });

  }));

  it("notifies with error response when member fetch fails.", function () {
    spyOn(Notification, 'errorResponse');
    $httpBackend.expectGET(MemberLookupUrl).respond(500);
    controller.fetchHuntMembers("sun").then(function () {
      expect(Notification.errorResponse).toHaveBeenCalledWith(jasmine.anything(),
        'huronHuntGroup.nameFetchFailure');
    });
    $httpBackend.flush();
  });

  it("calls the backend only after 3 key strokes.", function () {
    $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);
    controller.fetchHuntMembers("s");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // Not request made.

    controller.fetchHuntMembers("su");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // Not request made.

    controller.fetchHuntMembers("sun");
    $httpBackend.flush(); // Request made.
  });

  it("on selecting a member name, the selectedHuntMembers list is not updated.", function () {
    controller.selectHuntGroupMember(user1);
    expect(listContains(controller.selectedHuntMembers, user1)).toBeFalsy();
  });

  it("on selecting a phone line of a member, the member is added into selectedHuntMembers list " +
    "updating isSelected, selectedNumberUuid & showConfigSection to the right values.",
    function () {

      user1.numbers[0].isSelected = true;
      controller.selectHuntGroupMember(user1);

      expect(listContains(controller.selectedHuntMembers, user1)).toBeTruthy();
      expect(user1.selectedNumberUuid).toBe(user1.numbers[0].uuid);
      expect(user1.showConfigSection).toBeFalsy();
    });

  it("filters the selected members from showing in the drop down.", function () {
    // UI selected a member pill.
    user2.numbers[0].isSelected = true;
    controller.selectHuntGroupMember(user2);

    // Backend returns a list.
    $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);

    // UI must filter and show only the list that is not already selected.
    controller.fetchHuntMembers(user2.firstName).then(function (dropdownList) {
      expect(listContains(dropdownList, user2)).toBeFalsy();
    });
    $httpBackend.flush();
  });

  it("on deselecting a member, the list is updated and drop down starts showing the deselected member.",
    function () {

      user1.numbers[0].isSelected = true;
      controller.selectHuntGroupMember(user1); // user 1 selected.

      user2.numbers[1].isSelected = true;
      controller.selectHuntGroupMember(user2); // user 2 selected.

      // Backend returns a list.
      $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);

      // UI types in name of user1
      controller.fetchHuntMembers(user1.firstName).then(function (dropdownList) {
        expect(listContains(dropdownList, user1)).toBeFalsy(); // drop down must not show it.
      });
      $httpBackend.flush();

      controller.unSelectHuntGroupMember(user1); // used 1 is removed.

      // Backend returns a list.
      $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);

      // UI types in number of user1 again.
      controller.fetchHuntMembers(user1.firstName).then(function (dropdownList) {
        expect(listContains(dropdownList, user1)).toBeTruthy(); // drop down must show this time.
      });
      $httpBackend.flush();

  });

  it("huntMemberTelephone filter concatenates 'and' between int & ext number if both are present.",
    function () {
      expect(filter(user1.numbers[0])).toBe("(972) 510-4001 and 4001");
      expect(filter(user1.numbers[1])).toBe("1236");
  });

  it("displays the member name with firstName and lastName correctly.", function () {
    expect(controller.getDisplayName(user1)).toBe("Sundar Rajan Muthuraj");

    user1.lastName = "";
    expect(controller.getDisplayName(user1)).toBe("Sundar Rajan");
  });
});
