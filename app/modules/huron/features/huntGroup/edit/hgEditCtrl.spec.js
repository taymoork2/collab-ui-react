/**
 * Created by zamamoha on 10/20/15.
 */
'use strict';

describe('Hunt Group EditCtrl Controller', function () {

  var hgEditCtrl, controller, $httpBackend, $rootScope, $scope, $q, $state, $stateParams, $timeout, Authinfo,
    HuntGroupService, HuntGroupEditDataService, Notification, form;
  var hgFeature = getJSONFixture('huron/json/features/edit/featureDetails.json');
  var pilotNumbers = getJSONFixture('huron/json/features/edit/pilotNumbers.json');
  var GetMemberUrl = new RegExp(".*/api/v2/customers/1/users/.*");
  var user1 = getJSONFixture('huron/json/features/huntGroup/user1.json');
  var numbers = [{
    "internal": "8001",
    "external": "972-510-5002",
    "uuid": "eae8c29f-14b5-4528-b3f7-2e68f1d5c8b0",
    "isSelected": true
  }, {
    "internal": "5601",
    "external": "",
    "uuid": "d9ba914b-7747-48b8-b7ee-2793b3984ca6",
    "isSelected": false
  }];

  beforeEach(module('Huron'));
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(inject(function (_$rootScope_, $controller, _$httpBackend_, _$q_, _$state_, _$timeout_, _Authinfo_,
    _HuntGroupService_, _HuntGroupEditDataService_, _Notification_) {
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
    spyOn(HuntGroupService, 'updateHuntGroup').and.returnValue($q.when());
    spyOn(HuntGroupService, 'getAllUnassignedPilotNumbers').and.returnValue($q.when(pilotNumbers));

    $httpBackend.whenGET(GetMemberUrl).respond(200, user1);

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

  it('on removing fallback destination shows fallback warning (invalid)', function () {
    hgEditCtrl.removeFallbackDest();
    $scope.$apply();

    expect(hgEditCtrl.shouldShowFallbackWarning()).toBeTruthy();
    expect(hgEditCtrl.shouldShowFallbackLookup()).toBeTruthy();
    expect(hgEditCtrl.shouldShowFallbackPill()).toBeFalsy();
  });

  it('on changing fallback destination check if the form is marked dirty', function () {
    //spyOn(hgEditCtrl.form, '$setDirty');
    //var newHgFeature = angular.copy(hgFeature);
    //expect(hgEditCtrl.selectedFallbackMember.sendToVoicemail).toBeTruthy();
    //HuntGroupEditDataService.setPristine(newHgFeature);
    //hgEditCtrl.resetForm(false);
    //hgEditCtrl.selectedFallbackMember.sendToVoicemail = false; // Dirtying the model.
    //$scope.$apply();
    //
    //hgEditCtrl.checkFallbackDirtiness();
    //expect(hgEditCtrl.form.$setDirty).not.toHaveBeenCalled();
  });

  it('on selecting a hunt method, updates the model', function () {
    hgEditCtrl.selectHuntMethod('DA_LONGEST_IDLE_TIME');
    $scope.$apply();
    expect(hgEditCtrl.model.huntMethod).toEqual('DA_LONGEST_IDLE_TIME');
  });

  it('have intialized formly fields correctly', function () {
    expect(hgEditCtrl.fields.length).toEqual(4);
  });

});
