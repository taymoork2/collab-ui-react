/**
 * Created by zamamoha on 10/20/15.
 */
'use strict';

describe('Hunt Group EditCtrl Controller', function () {

  var hgEditCtrl, controller, $httpBackend, $scope, $q, $state, $stateParams, $timeout, Authinfo,
    HuntGroupService, HuntGroupEditDataService, HuntGroupMemberDataService, Notification, form, HuntGroupFallbackDataService;
  var hgFeature = getJSONFixture('huron/json/features/edit/featureDetails.json');
  var pilotNumbers = getJSONFixture('huron/json/features/edit/pilotNumbers.json');
  var GetMember1Url = new RegExp(".*/api/v2/customers/1/users/ba6c9d76-bed9-413f-a373-054a40df7095.*");
  var GetMember2Url = new RegExp(".*/api/v2/customers/1/users/5dea2d85-7f23-4392-a1bc-360b8a74a487.*");
  var GetMemberListUrl = new RegExp(".*/api/v2/customers/1/users?.*");
  var GetFallbackNumbersUrl = new RegExp(".*/api/v2/customers/1/numbers.*");
  var user1 = getJSONFixture('huron/json/features/huntGroup/member1.json');
  var user2 = getJSONFixture('huron/json/features/huntGroup/member2.json');
  var member1ResponseHandler, member2ResponseHandler;
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
    _HuntGroupService_, _HuntGroupEditDataService_, _HuntGroupMemberDataService_, _Notification_, _HuntGroupFallbackDataService_) {
    controller = $controller;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    HuntGroupService = _HuntGroupService_;
    Notification = _Notification_;
    HuntGroupEditDataService = _HuntGroupEditDataService_;
    HuntGroupMemberDataService = _HuntGroupMemberDataService_;
    HuntGroupFallbackDataService = _HuntGroupFallbackDataService_;
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
    spyOn(HuntGroupService, 'getDetails').and.returnValue($q.when(hgFeature));
    spyOn(HuntGroupService, 'getAllUnassignedPilotNumbers').and.returnValue($q.when(pilotNumbers));
    spyOn(HuntGroupFallbackDataService, 'isVoicemailDisabled').and.returnValue($q.defer().promise);
    member1ResponseHandler = $httpBackend.whenGET(GetMember1Url).respond(200, user1);
    member2ResponseHandler = $httpBackend.whenGET(GetMember2Url).respond(200, user2);

    hgEditCtrl = $controller('HuntGroupEditCtrl', {
      $state: $state,
      $stateParams: $stateParams,
      $timeout: $timeout,
      Authinfo: Authinfo,
      HuntGroupService: HuntGroupService,
      Notification: Notification
    });

    hgEditCtrl.form = form;
    $scope.$apply();
    $timeout.flush();
    $httpBackend.flush();
  }));

  it('should get initialized in the happy path', function () {
    expect(hgEditCtrl.isLoadingCompleted).toEqual(true);
  });

  it('should redirect to features page if hg id is unavailable', function () {
    hgEditCtrl = controller('HuntGroupEditCtrl', {
      $state: $state,
      $stateParams: {},
      $timeout: $timeout,
      Authinfo: Authinfo,
      HuntGroupService: HuntGroupService,
      Notification: Notification
    });
    $scope.$apply();
    expect($state.go).toHaveBeenCalledWith("huronfeatures");
    expect(hgEditCtrl.isLoadingCompleted).toEqual(false);
  });

  it('should throw error notification when edit service failed to fetch hg', function () {
    spyOn(HuntGroupEditDataService, 'fetchHuntGroup').and.returnValue($q.reject("Error"));
    hgEditCtrl = controller('HuntGroupEditCtrl', {
      $state: $state,
      $stateParams: $stateParams,
      $timeout: $timeout,
      Authinfo: Authinfo,
      HuntGroupService: HuntGroupService,
      Notification: Notification
    });
    $scope.$apply();
    expect(Notification.errorResponse).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith("huronfeatures");
    expect(hgEditCtrl.isLoadingCompleted).toEqual(false);
  });

  it('on resetting the form, the model has pristine data from edit service', function () {
    var newHgFeature = angular.copy(hgFeature);
    newHgFeature.name = "Test Model";
    expect(hgEditCtrl.model.name).not.toEqual(newHgFeature.name);
    expect(hgEditCtrl.model.name).toEqual(hgFeature.name); // Existing model.

    HuntGroupEditDataService.setPristine(newHgFeature);
    hgEditCtrl.resetForm();
    $scope.$apply();
    expect(hgEditCtrl.model.name).toEqual(newHgFeature.name); // Pristine model.
  });

  it('on removing fallback destination shows fallback warning (invalid) and form is dirty', function () {
    spyOn(hgEditCtrl.form, '$setDirty');
    hgEditCtrl.removeFallbackDest();
    $scope.$apply();

    expect(hgEditCtrl.shouldShowFallbackWarning()).toBeTruthy();
    expect(hgEditCtrl.shouldShowFallbackLookup()).toBeTruthy();
    expect(hgEditCtrl.shouldShowFallbackPill()).toBeFalsy();
    expect(hgEditCtrl.form.$setDirty).toHaveBeenCalled();
  });

  it('on init when one of the member fetch fails, notification is shown and state goes to features', function () {
    member1ResponseHandler.respond(404, '');

    hgEditCtrl = controller('HuntGroupEditCtrl', {
      $state: $state,
      $stateParams: $stateParams,
      $timeout: $timeout,
      Authinfo: Authinfo,
      HuntGroupService: HuntGroupService,
      Notification: Notification
    });
    $httpBackend.flush();
    $scope.$apply();
    expect(Notification.errorResponse).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalledWith('huronfeatures');
  });

  it('on removing a hunt member list the form is marked dirty', function () {
    spyOn(hgEditCtrl.form, '$setDirty');
    hgEditCtrl.unSelectHuntGroupMember(hgEditCtrl.selectedHuntMembers[0].user);
    expect(hgEditCtrl.openMemberPanelUuid).toBeUndefined();
    expect(hgEditCtrl.form.$setDirty).toHaveBeenCalled();
  });

  it('on adding a new hunt member the form is marked dirty', function () {
    var newUser = angular.copy(hgEditCtrl.selectedHuntMembers[0]);
    newUser.uuid = "test";
    newUser.user.uuid = "test";
    var initMembersCount = hgEditCtrl.selectedHuntMembers.length;
    spyOn(hgEditCtrl.form, '$setDirty');
    hgEditCtrl.selectHuntGroupMember(newUser);
    expect(hgEditCtrl.openMemberPanelUuid).toBeUndefined();
    expect(hgEditCtrl.form.$setDirty).toHaveBeenCalled();
    expect(initMembersCount + 1).toEqual(hgEditCtrl.selectedHuntMembers.length);
  });

  it('on changing a hunt member phone line the form is marked dirty', function () {
    spyOn(hgEditCtrl.form, '$setDirty');
    var member1 = hgEditCtrl.selectedHuntMembers[0];
    member1.selectableNumber = member1.user.numbers[1];
    hgEditCtrl.checkMemberDirtiness(member1.user.uuid);
    expect(hgEditCtrl.form.$setDirty).toHaveBeenCalled();
  });

  it('on looking up new members, is able to fetch the members from member data service', function () {
    $httpBackend.expectGET(GetMemberListUrl).respond(200, members);
    hgEditCtrl.fetchHuntMembers("me");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // No request made.

    hgEditCtrl.fetchHuntMembers("mem");
    $httpBackend.flush();
  });

  it('on trying to change fallback member, is able to fetch the members from member data service', function () {
    $httpBackend.expectGET(GetMemberListUrl).respond(200, members);
    hgEditCtrl.fetchFallbackDestination("me");
    $scope.$apply();
    $httpBackend.verifyNoOutstandingRequest(); // No request made.

    hgEditCtrl.fetchFallbackDestination("mem");
    $httpBackend.flush();
  });

  it('disables the save button when it fines the vm.form.invalid is true', function () {
    hgEditCtrl.form.$invalid = true;
    expect(hgEditCtrl.showDisableSave()).toBeTruthy();

    hgEditCtrl.form.$invalid = false;
    expect(hgEditCtrl.showDisableSave()).toBeFalsy();
    hgEditCtrl.removeFallbackDest();
    expect(hgEditCtrl.showDisableSave()).toBeTruthy();

    hgEditCtrl.selectedFallbackNumber = "+19723453456";
    hgEditCtrl.validateFallbackNumber();
    expect(hgEditCtrl.showDisableSave()).toBeFalsy();

  });

  it('shows fallback lookup field when there is a valid fallback number', function () {
    hgEditCtrl.selectedFallbackNumber = "+19723453456";
    hgEditCtrl.validateFallbackNumber();
    expect(hgEditCtrl.shouldShowFallbackLookup()).toBeTruthy();
  });

  it('check fallback dirtiness when fallback number is invalid', function () {
    spyOn(hgEditCtrl.form, '$setDirty');
    hgEditCtrl.selectedFallbackNumber = "3456";
    $httpBackend.expectGET(GetFallbackNumbersUrl).respond(200, {
      numbers: []
    });
    hgEditCtrl.validateFallbackNumber();
    $httpBackend.flush();
    hgEditCtrl.checkFallbackDirtiness();
    expect(hgEditCtrl.form.$setDirty).toHaveBeenCalled();
  });

  it('on toggle hunt member panel, openMemberPanelUuid is updated correctly', function () {
    expect(hgEditCtrl.openMemberPanelUuid).toBeUndefined();

    var newUser = angular.copy(user1);
    newUser.email = "test@cisco.com";
    member1ResponseHandler.respond(200, newUser);
    hgEditCtrl.toggleMemberPanel(hgEditCtrl.selectedHuntMembers[0].user);
    $scope.$apply();
    $httpBackend.flush();
    expect(hgEditCtrl.openMemberPanelUuid).toEqual(hgEditCtrl.selectedHuntMembers[0].user.uuid);

    hgEditCtrl.toggleMemberPanel(hgEditCtrl.selectedHuntMembers[0].user);
    $scope.$apply();
    expect(hgEditCtrl.openMemberPanelUuid).toBeUndefined();

    newUser = angular.copy(user2);
    newUser.email = "test@cisco.com";
    member2ResponseHandler.respond(200, newUser);
    hgEditCtrl.toggleMemberPanel(hgEditCtrl.selectedHuntMembers[1].user);
    $scope.$apply();
    $httpBackend.flush();
    expect(hgEditCtrl.openMemberPanelUuid).toEqual(hgEditCtrl.selectedHuntMembers[1].user.uuid);
  });

  it('on toggle fallback panel, openPanel is updated correctly', function () {
    var fbUser = {
      "uuid": "ba6c9d76-bed9-413f-a373-054a40df7095",
      "user": user1,
      "selectableNumber": {
        "internal": "2043",
        "external": "",
        "uuid": "bbdfc3bc-ca48-4d13-b8cc-9554ce71203b"
      }
    };

    hgEditCtrl.selectFallback(fbUser);
    $scope.$apply();
    expect(hgEditCtrl.selectedFallbackMember.openPanel).toBeFalsy();

    var newUser = angular.copy(user1);
    newUser.email = "test@cisco.com";
    member1ResponseHandler.respond(200, newUser);

    hgEditCtrl.toggleFallback();
    $scope.$apply();
    $httpBackend.flush();
    expect(hgEditCtrl.selectedFallbackMember.openPanel).toBeTruthy();

    hgEditCtrl.toggleFallback();
    $scope.$apply();
    expect(hgEditCtrl.selectedFallbackMember.openPanel).toBeFalsy();
  });

  it('on changing a hunt member orders in the list the form is marked dirty', function () {
    spyOn(hgEditCtrl.form, '$setDirty');
    hgEditCtrl.callback();
    expect(hgEditCtrl.form.$setDirty).toHaveBeenCalled();
  });

  it('on validateFallbackNumber, applies validation and dirties the form', function () {
    spyOn(hgEditCtrl.form, '$setDirty');
    hgEditCtrl.validateFallbackNumber();
    expect(hgEditCtrl.form.$setDirty).not.toHaveBeenCalled();

    hgEditCtrl.selectedFallbackNumber = "+19723453457";
    hgEditCtrl.validateFallbackNumber();
    expect(hgEditCtrl.form.$setDirty).toHaveBeenCalled();
  });

  it('gets the display name of a user with firstName and lastName concatenation', function () {
    hgEditCtrl.resetForm();
    $scope.$apply();
    expect(hgEditCtrl.getDisplayName(hgEditCtrl.selectedHuntMembers[0].user)).toEqual("member1 hg");
  });

  it('isMembersInvalid check works based on selectedHuntMembers', function () {
    expect(hgEditCtrl.isMembersInvalid()).toBeFalsy();
    hgEditCtrl.selectedHuntMembers = undefined;
    expect(hgEditCtrl.isMembersInvalid()).toBeTruthy();
  });

  it('on selecting a hunt method, updates the model', function () {
    hgEditCtrl.selectHuntMethod('DA_LONGEST_IDLE_TIME');
    $scope.$apply();
    expect(hgEditCtrl.model.huntMethod).toEqual('DA_LONGEST_IDLE_TIME');
  });

  it('have intialized formly fields correctly', function () {
    expect(hgEditCtrl.fields.length).toEqual(4);
  });

  it('on save hunt group success updates the pristine model', function () {
    var hgFeaturePristine = HuntGroupEditDataService.getPristine();
    expect(hgFeaturePristine.name).toEqual("HuntGroupUnitTest");

    hgEditCtrl.model.name = "NewHuntGroup";
    spyOn(HuntGroupService, 'updateHuntGroup').and.returnValue($q.when());
    hgEditCtrl.saveForm();
    $scope.$apply();

    hgFeaturePristine = HuntGroupEditDataService.getPristine();
    expect(hgFeaturePristine.name).toEqual("NewHuntGroup");
  });

  it('on save hunt group failure does not change the pristine model', function () {
    var hgFeaturePristine = HuntGroupEditDataService.getPristine();
    expect(hgFeaturePristine.name).toEqual("HuntGroupUnitTest");

    hgEditCtrl.model.name = "NewHuntGroup";
    spyOn(HuntGroupService, 'updateHuntGroup').and.returnValue($q.reject());
    hgEditCtrl.saveForm();
    $scope.$apply();

    hgFeaturePristine = HuntGroupEditDataService.getPristine();
    expect(hgFeaturePristine.name).toEqual("HuntGroupUnitTest");
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

      HuntGroupMemberDataService.reset(false); // removes all members.

      // network responses came out of order:
      // check setMemberJson -> getMemberAsynchronously
      HuntGroupMemberDataService.selectMember(member2);
      HuntGroupMemberDataService.selectMember(member1);

      expect(
        HuntGroupMemberDataService.getHuntMembers()[0].uuid).toEqual(member2.uuid);
      expect(
        HuntGroupMemberDataService.getHuntMembers()[1].uuid).toEqual(member1.uuid);

      // this is the order that JSON expects in huntgroup:
      var usersJSON = [{
        "userName": user1.firstName + " " + user1.lastName,
        "userUuid": user1.uuid,
        "number": user1.numbers[0].number,
        "numberUuid": user1.numbers[0].uuid
      }, {
        "userName": user2.firstName + " " + user2.lastName,
        "userUuid": user2.uuid,
        "number": user2.numbers[0].number,
        "numberUuid": user2.numbers[0].uuid
      }];

      // rearrangeResponsesInSequence corrects the order:
      HuntGroupMemberDataService.rearrangeResponsesInSequence(usersJSON);
      expect(
        HuntGroupMemberDataService.getHuntMembers()[0].uuid).toEqual(member1.uuid);
      expect(
        HuntGroupMemberDataService.getHuntMembers()[1].uuid).toEqual(member2.uuid);
    });
});
