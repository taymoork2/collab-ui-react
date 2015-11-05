/**
 * Created by zamamoha on 10/20/15.
 */
'use strict';

describe('Hunt Group EditCtrl Controller', function () {

  var hgEditCtrl, $rootScope, $scope, $q, $state, $timeout, Authinfo, HuntGroupService, Notification, form;
  var hgFeature = getJSONFixture('huron/json/features/edit/featureDetails.json');
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

  beforeEach(inject(function (_$rootScope_, $controller, _$q_, _$state_, _$timeout_, _Authinfo_, _HuntGroupService_, _Notification_) {
    $scope = _$rootScope_.$new();
    $state = _$state_;
    $timeout = _$timeout_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    HuntGroupService = _HuntGroupService_;
    Notification = _Notification_;
    var emptyForm = function () {
      return true;
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
    hgEditCtrl = $controller('HuntGroupEditCtrl', {
      $state: $state,
      $timeout: $timeout,
      Authinfo: Authinfo,
      HuntGroupService: HuntGroupService,
      Notification: Notification
    });

    hgEditCtrl.form = form;
    $scope.$apply();
    $timeout.flush();
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

  it('Select Hunt Group Fallback User', function () {
    var item = hgEditCtrl.userData[2];
    item.numbers = numbers;
    hgEditCtrl.selectHuntGroupUser(item);
    $scope.$apply();

    expect(hgEditCtrl.model.fallbackDestination.userName).toEqual(item.userName);
  });

  it('Select Hunt Group Member', function () {
    var item = hgEditCtrl.userData[1];
    item.numbers = numbers;
    hgEditCtrl.selectHuntGroupMember(item);
    $scope.$apply();

    expect(hgEditCtrl.model.members[1].userName).toEqual(item.userName);
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
