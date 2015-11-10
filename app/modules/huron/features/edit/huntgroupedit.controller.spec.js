/**
 * Created by zamamoha on 10/20/15.
 */
'use strict';

describe('Hunt Group EditCtrl Controller', function () {

  var hgEditCtrl, $httpBackend, $rootScope, $scope, $q, $state, $stateParams, $timeout, Authinfo, HuntGroupService, Notification, form;
  var hgFeature = getJSONFixture('huron/json/features/edit/featureDetails.json');
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

  beforeEach(inject(function (_$rootScope_, $controller, _$httpBackend_, _$q_, _$state_, _$timeout_, _Authinfo_, _HuntGroupService_, _Notification_) {
    $scope = _$rootScope_.$new();
    $state = _$state_;
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    HuntGroupService = _HuntGroupService_;
    Notification = _Notification_;
    var emptyForm = function () {
      return true;
    };
    $stateParams = {
      feature: {
        huntGroupId: '111'
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
    spyOn(Notification, 'error');
    spyOn(HuntGroupService, 'getDetails').and.returnValue($q.when(hgFeature));
    spyOn(HuntGroupService, 'updateHuntGroup').and.returnValue($q.when());
    spyOn(HuntGroupService, 'getNumbersWithSelection').and.returnValue($q.when());

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

  it('Controller Should get Initialized', function () {
    expect(hgEditCtrl.initialized).toEqual(true);
  });

  it('Controller Should set the title', function () {
    expect(hgEditCtrl.title).toHaveValue();
  });
  it('Formly Fields should be initialized', function () {
    expect(hgEditCtrl.fields.length).toEqual(4);
  });
  it('Remove Fallback Destination should dirty the form', function () {
    hgEditCtrl.removeFallbackDest();
    $scope.$apply();

    expect(hgEditCtrl.addFallback).toBeTruthy();
  });

  it('Remove Hunt Member', function () {
    var item = hgFeature.members[0];
    hgEditCtrl.removeHuntMember(item);
    $scope.$apply();

    var index = hgEditCtrl.model.members.indexOf(item);
    expect(index).toEqual(-1);
  });

  it('Select Hunt Method', function () {
    hgEditCtrl.selectHuntMethod('broadcast');
    $scope.$apply();

    expect(hgEditCtrl.model.huntMethod).toEqual('broadcast');
  });

  it('Should Save form', function () {
    hgEditCtrl.saveForm();
    $scope.$apply();

    expect(Notification.success).toHaveBeenCalled();
  });
});
