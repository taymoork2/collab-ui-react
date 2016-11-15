'use strict';

describe('Controller: HuntGroupSetupAssistantCtrl - Hunt Member Lookup', function () {

  var $httpBackend, filter, controller, $scope, Notification;

  var user1 = getJSONFixture('huron/json/features/huntGroup/user1.json');
  var user2 = getJSONFixture('huron/json/features/huntGroup/user2.json');

  var successResponse = {
    "users": [user1, user2]
  };

  var member1 = {
    uuid: user1.uuid,
    displayUser: true,
    user: user1,
    selectableNumber: user1.numbers[0]
  };

  var member2 = {
    uuid: user2.uuid,
    displayUser: true,
    user: user2,
    selectableNumber: user2.numbers[0]
  };

  function listContains(someList, item) {
    return (someList.filter(function (elem) {
      return (elem.uuid == item.uuid);
    })).length > 0;
  }

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  var MemberLookupUrl = new RegExp(".*/customers/1/users.*");
  var GetMember = new RegExp(".*/customers/1/users/.*");

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _$filter_, _Notification_) {
    $scope = $rootScope.$new();
    Notification = _Notification_;
    $httpBackend = _$httpBackend_;
    filter = _$filter_('huntMemberTelephone');

    controller = $controller('HuntGroupSetupAssistantCtrl', {
      $scope: $scope,
      Notification: Notification
    });

  }));

  it("notifies with error response when member fetch fails.", function () {
    spyOn(Notification, 'errorResponse');
    $httpBackend.expectGET(MemberLookupUrl).respond(500);
    controller.fetchHuntMembers("sun").then(function () {
      expect(Notification.errorResponse).toHaveBeenCalledWith(jasmine.anything(),
        'huronHuntGroup.memberFetchFailure');
    });
    $httpBackend.flush();
  });

  it("calls the backend only after 3 key strokes.", function () {
    $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);
    controller.fetchHuntMembers("s");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // No request made.

    controller.fetchHuntMembers("su");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // No request made.

    controller.fetchHuntMembers("sun");
    $httpBackend.flush(); // Request made.
  });

  it("on selecting & toggling a member, the member is added into selectedHuntMembers " +
    "list with email id retrieved from backend.",
    function () {
      user1.email = "sumuthur@cisco.com";
      user2.email = undefined;

      controller.selectHuntGroupMember(member2);

      $httpBackend.expectGET(GetMember).respond(200, user1);
      controller.toggleMemberPanel(member2.user);
      $httpBackend.flush();

      expect(member2.user.email).toEqual(user1.email);
      expect(listContains(controller.selectedHuntMembers, member2)).toBeTruthy();
    });

  it("filters the selected members from showing in the drop down.", function () {
    // UI selected a member pill.
    controller.selectHuntGroupMember(member2);

    // Backend returns a list.
    $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);

    // UI must filter and show only the list that is not already selected.
    controller.fetchHuntMembers(user2.firstName).then(function (dropdownList) {
      expect(listContains(dropdownList, member2)).toBeFalsy();
    });
    $httpBackend.flush();
  });

  it("on deselecting a member, the list is updated and drop down starts showing the deselected member.",
    function () {

      controller.selectHuntGroupMember(member1);
      controller.selectHuntGroupMember(member2);

      // Backend returns a list.
      $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);

      // UI types in name of user1
      controller.fetchHuntMembers(user1.firstName).then(function (dropdownList) {
        expect(listContains(dropdownList, member1)).toBeFalsy(); // drop down must not show it.
      });
      $httpBackend.flush();

      controller.unSelectHuntGroupMember(member1); // used 1 is removed.

      // Backend returns a list.
      $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);

      // UI types in number of user1 again.
      controller.fetchHuntMembers(user1.firstName).then(function (dropdownList) {
        expect(listContains(dropdownList, member1)).toBeTruthy(); // drop down must show this time.
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

  it("member pane open works like accordion based on user's uuid.", function () {
    //toggleMemberPanel is invoked while clicking the card header, with user uuid as argument.
    controller.openMemberPanelUuid = undefined;
    user1.email = undefined;
    user2.email = undefined;

    controller.selectHuntGroupMember(member1);
    controller.selectHuntGroupMember(member2);

    toggleAndFetchEmail(user1, {
      email: "test1@cisco.com"
    }); // user1 header clicked.
    expect(controller.openMemberPanelUuid).toBe(user1.uuid); // opens user1 panel.

    controller.toggleMemberPanel(user1); // user1 header clicked again.
    $scope.$apply();
    expect(controller.openMemberPanelUuid).toBeUndefined(); //closes user1 panel.

    controller.toggleMemberPanel(user1); // user1 header clicked.
    $scope.$apply();
    toggleAndFetchEmail(user2, {
      email: "test2@cisco.com"
    }); // user2 header clicked.
    expect(controller.openMemberPanelUuid).toBe(user2.uuid); //shows user2 panel.
  });

  function toggleAndFetchEmail(user, email) {
    $httpBackend.expectGET(GetMember).respond(200, email);
    controller.toggleMemberPanel(user);
    $httpBackend.flush();
  }

  it("shows primary indicator when input typed is less than 3",
    function () {
      controller.fetchHuntMembers("s");
      $scope.$apply();
      expect(controller.errorMemberInput).toBeFalsy();

      controller.fetchHuntMembers("su");
      $scope.$apply();
      expect(controller.errorMemberInput).toBeFalsy();
    }
  );

  it("shows danger indicator when input typed is >= 3 and no valid suggestions.", function () {
    controller.selectHuntGroupMember(member1);
    var noSuggestion = {
      "users": []
    };
    $httpBackend.expectGET(MemberLookupUrl).respond(200, noSuggestion);
    controller.fetchHuntMembers("sun");
    $scope.$apply();
    $httpBackend.flush(); // Request made.
    expect(controller.errorMemberInput).toBeTruthy();

    $httpBackend.expectGET(MemberLookupUrl).respond(200, successResponse);
    controller.fetchHuntMembers("sun");
    $scope.$apply();
    $httpBackend.flush(); // Request made.
    expect(controller.errorMemberInput).toBeFalsy();
  });
});
