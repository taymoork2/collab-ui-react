'use strict';

describe('Controller: InternationalDialingInfoCtrl', function () {
  var controller, $controller, $scope, $q, $httpBackend, InternationalDialing, Notification, HuronConfig;
  var url;
  var getDeferred;
  var currentUser = getJSONFixture('core/json/currentUser.json');
  var cosRestrictionsObject = getJSONFixture('huron/json/user/cosRestrictionsObject.json');

  var $stateParams = {
    currentUser: currentUser
  };

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$httpBackend_, _InternationalDialing_, _Notification_, _HuronConfig_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;
    HuronConfig = _HuronConfig_;
    InternationalDialing = _InternationalDialing_;
    $q = _$q_;

    url = HuronConfig.getCmiUrl() + '/voice/customers/' + currentUser.meta.organizationID + '/users/' + currentUser.id + '/features/restrictions';

    spyOn(Notification, 'notify');
    spyOn(InternationalDialing, 'listCosRestrictions').and.returnValue($q.when(cosRestrictionsObject));
    spyOn(InternationalDialing, 'updateCosRestriction').and.returnValue($q.when());

    controller = $controller('InternationalDialingInfoCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      InternationalDialing: InternationalDialing,
      Notification: Notification
    });

    $scope.$apply();
  }));

  it('should update international dialing when toggle is OFF', function () {
    controller.save();
    $scope.$apply();

    expect(InternationalDialing.updateCosRestriction).toHaveBeenCalled();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    expect(controller.model.internationalDialingEnabled.value).toEqual('1');
  });
});
