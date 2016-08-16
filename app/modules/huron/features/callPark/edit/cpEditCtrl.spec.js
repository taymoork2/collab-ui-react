'use strict';

describe('Call Park EditCtrl Controller', function () {

  var cpEditCtrl, controller, $httpBackend, $scope, $q, $state, $stateParams, $timeout, Authinfo,
    CallParkService, CallParkEditDataService, CallParkMemberDataService, Notification, form;
  var cpFeature = getJSONFixture('huron/json/features/callPark/oneCp.json');
  var GetMember1Url = new RegExp(".*/api/v2/customers/1/users/abcd1234-abcd-abcd-abcddef123456.*");
  var GetMember2Url = new RegExp(".*/api/v2/customers/1/users/abcd5678-abcd-abcd-abcddef567890.*");
  var GetMemberListUrl = new RegExp(".*/api/v2/customers/1/users?.*");
  var user1 = getJSONFixture('huron/json/features/callPark/member1.json');
  var user2 = getJSONFixture('huron/json/features/callPark/member2.json');
  var member1ResponseHandler;
  var members = {
    "users": [user1, user2]
  };

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(inject(function (_$rootScope_, $controller, _$httpBackend_, _$q_, _$state_, _$timeout_, _Authinfo_,
    _CallParkService_, _CallParkEditDataService_, _CallParkMemberDataService_, _Notification_) {
    controller = $controller;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    CallParkService = _CallParkService_;
    Notification = _Notification_;
    CallParkEditDataService = _CallParkEditDataService_;
    CallParkMemberDataService = _CallParkMemberDataService_;
    var emptyForm = function () {
      return true;
    };
    $stateParams = {
      feature: {
        id: '111'
      }
    };
    form = {
      '$invalid': false,
      $setDirty: emptyForm,
      $setPristine: emptyForm,
      $setUntouched: emptyForm
    };

    spyOn($state, 'go');
    spyOn(Notification, 'success');
    spyOn(Notification, 'errorResponse');
    spyOn(CallParkService, 'getDetails').and.returnValue($q.when(cpFeature));
    $httpBackend.expectGET(GetMemberListUrl).respond(200, members);
    member1ResponseHandler = $httpBackend.whenGET(GetMember1Url).respond(200, user1);
    $httpBackend.whenGET(GetMember2Url).respond(200, user2);

    cpEditCtrl = $controller('CallParkEditCtrl', {
      $state: $state,
      $stateParams: $stateParams,
      $timeout: $timeout,
      Authinfo: Authinfo,
      CallParkService: CallParkService,
      Notification: Notification
    });

    cpEditCtrl.form = form;
    $scope.$apply();
    $timeout.flush();
    $httpBackend.flush();
  }));

  it('should get initialized in the happy path', function () {
    expect(cpEditCtrl.isLoadingCompleted).toEqual(true);
  });

  it('should redirect to features page if cp id is unavailable', function () {
    cpEditCtrl = controller('CallParkEditCtrl', {
      $state: $state,
      $stateParams: {},
      $timeout: $timeout,
      Authinfo: Authinfo,
      CallParkService: CallParkService,
      Notification: Notification
    });
    $scope.$apply();
    expect($state.go).toHaveBeenCalledWith("huronfeatures");
    expect(cpEditCtrl.isLoadingCompleted).toEqual(false);
  });

  it('should throw error notification when edit service failed to fetch cp', function () {
    spyOn(CallParkEditDataService, 'fetchCallPark').and.returnValue($q.reject("Error"));
    cpEditCtrl = controller('CallParkEditCtrl', {
      $state: $state,
      $stateParams: $stateParams,
      $timeout: $timeout,
      Authinfo: Authinfo,
      CallParkService: CallParkService,
      Notification: Notification
    });
    $scope.$apply();
    expect(Notification.errorResponse).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith("huronfeatures");
    expect(cpEditCtrl.isLoadingCompleted).toEqual(false);
  });

  it('on resetting the form, the model has pristine data from edit service', function () {
    var newCpFeature = angular.copy(cpFeature);
    newCpFeature.name = "Test Model";
    expect(cpEditCtrl.name).not.toEqual(newCpFeature.name);
    expect(cpEditCtrl.name).toEqual(cpFeature.name); // Existing model.

    CallParkEditDataService.setPristine(newCpFeature);
    cpEditCtrl.resetForm();
    $scope.$apply();
    expect(cpEditCtrl.name).toEqual(newCpFeature.name); // Pristine model.
  });

  it('on removing a member list the form is marked dirty', function () {
    spyOn(cpEditCtrl.form, '$setDirty');
    cpEditCtrl.unSelectCallParkMember(cpEditCtrl.selectedMembers[0].user);
    expect(cpEditCtrl.openMemberPanelUuid).toBeUndefined();
    expect(cpEditCtrl.form.$setDirty).toHaveBeenCalled();
  });

  it('on adding a new member the form is marked dirty', function () {
    var newUser = angular.copy(cpEditCtrl.selectedMembers[0]);
    newUser.uuid = "test";
    newUser.user.uuid = "test";
    var initMembersCount = cpEditCtrl.selectedMembers.length;
    spyOn(cpEditCtrl.form, '$setDirty');
    cpEditCtrl.selectCallParkMember(newUser);
    expect(cpEditCtrl.openMemberPanelUuid).toBeUndefined();
    expect(cpEditCtrl.form.$setDirty).toHaveBeenCalled();
    expect(initMembersCount + 1).toEqual(cpEditCtrl.selectedMembers.length);
  });

  it('on looking up new members, is able to fetch the members from member data service', function () {
    $httpBackend.expectGET(GetMemberListUrl).respond(200, members);
    cpEditCtrl.fetchMembers("me");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // No request made.

    cpEditCtrl.fetchMembers("mem");
    $httpBackend.flush();
  });

  it('disables the save button when it fines the vm.form.invalid is true', function () {
    cpEditCtrl.form.$invalid = true;
    expect(cpEditCtrl.showDisableSave()).toBeTruthy();

    cpEditCtrl.form.$invalid = false;
    expect(cpEditCtrl.showDisableSave()).toBeFalsy();
  });

  it('on toggle member panel, openMemberPanelUuid is updated correctly', function () {
    expect(cpEditCtrl.openMemberPanelUuid).toBeUndefined();

    var newUser = angular.copy(user1);
    newUser.email = "test@cisco.com";
    member1ResponseHandler.respond(200, newUser);
    cpEditCtrl.toggleMemberPanel(cpEditCtrl.selectedMembers[0].user);
    $scope.$apply();
    $httpBackend.flush();
    expect(cpEditCtrl.openMemberPanelUuid).toEqual(cpEditCtrl.selectedMembers[0].user.uuid);
  });

  it('on changing a member orders in the list the form is marked dirty', function () {
    spyOn(cpEditCtrl.form, '$setDirty');
    cpEditCtrl.callback();
    expect(cpEditCtrl.form.$setDirty).toHaveBeenCalled();
  });

  it('gets the display name of a user with firstName and lastName concatenation', function () {
    cpEditCtrl.resetForm();
    $scope.$apply();
    expect(cpEditCtrl.getDisplayName(cpEditCtrl.selectedMembers[0].user)).toEqual("member2 cp");
  });

  it('isMembersInvalid check works based on selectedMembers', function () {
    expect(cpEditCtrl.isMembersInvalid()).toBeFalsy();
    cpEditCtrl.selectedMembers = undefined;
    expect(cpEditCtrl.isMembersInvalid()).toBeTruthy();
  });

  it('have intialized template fields correctly', function () {
    expect(cpEditCtrl.cpNumberOptions.length).toEqual(1);
  });

  it('on save success updates the pristine model', function () {
    var cpFeaturePristine = CallParkEditDataService.getPristine();
    expect(cpFeaturePristine.name).toEqual("Technical Support");

    cpEditCtrl.name = "NewCallPark";
    spyOn(CallParkService, 'updateCallPark').and.returnValue($q.when());
    cpEditCtrl.saveForm();
    $scope.$apply();

    cpFeaturePristine = CallParkEditDataService.getPristine();
    expect(cpFeaturePristine.name).toEqual("NewCallPark");
  });

  it('on save failure does not change the pristine model', function () {
    var cpFeaturePristine = CallParkEditDataService.getPristine();
    expect(cpFeaturePristine.name).toEqual("Technical Support");

    cpEditCtrl.name = "NewCallPark";
    spyOn(CallParkService, 'updateCallPark').and.returnValue($q.reject());
    cpEditCtrl.saveForm();
    $scope.$apply();

    cpFeaturePristine = CallParkEditDataService.getPristine();
    expect(cpFeaturePristine.name).toEqual("Technical Support");
    expect(Notification.errorResponse).toHaveBeenCalled();
  });

  it('able to get the right order of members from member data services if there are' +
    ' network delays fetching individual members asynchronously',
    function () {
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

      CallParkMemberDataService.reset(false); // removes all members.

      // network responses came out of order:
      // check setMemberJson -> getMemberAsynchronously
      CallParkMemberDataService.selectMember(member2);
      CallParkMemberDataService.selectMember(member1);

      expect(
        CallParkMemberDataService.getCallParkMembers()[0].uuid).toEqual(member2.uuid);
      expect(
        CallParkMemberDataService.getCallParkMembers()[1].uuid).toEqual(member1.uuid);

      // this is the order that JSON expects in huntgroup:
      var usersJSON = [{
        "userName": user1.firstName + " " + user1.lastName,
        "memberUuid": user1.uuid,
      }, {
        "userName": user2.firstName + " " + user2.lastName,
        "memberUuid": user2.uuid,
      }];

      // rearrangeResponsesInSequence corrects the order:
      CallParkMemberDataService.rearrangeResponsesInSequence(usersJSON);
      expect(
        CallParkMemberDataService.getCallParkMembers()[0].uuid).toEqual(member1.uuid);
      expect(
        CallParkMemberDataService.getCallParkMembers()[1].uuid).toEqual(member2.uuid);
    });
  it('on changing radio selection to an option with invalid fields the form becomes invalid and disables the save button', function () {
    cpEditCtrl.name = "New Call Park";
    cpEditCtrl.cpNumberOptions[0].currentInput = 0;
    cpEditCtrl.cpNumberOptions[0].inputs[0].range_1.value = '6000';
    cpEditCtrl.cpNumberOptions[0].inputs[0].range_2.value = '6010';
    cpEditCtrl.cpNumberOptions[0].inputs[1].value = '';
    cpEditCtrl.selectedMembers = [{
      name: "Test Member",
      memberUuid: "123"
    }];
    $scope.$apply();
    expect(cpEditCtrl.showDisableSave()).toBeFalsy();
    cpEditCtrl.cpNumberOptions[0].currentInput = 1;
    $scope.$apply();
    expect(cpEditCtrl.showDisableSave()).toBeTruthy();
  });
});
