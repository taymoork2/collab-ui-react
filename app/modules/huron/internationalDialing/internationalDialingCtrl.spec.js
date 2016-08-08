'use strict';

describe('Controller: InternationalDialingInfoCtrl', function () {
  var controller, $controller, $scope, $q, InternationalDialing, Notification;
  var currentUser = getJSONFixture('core/json/currentUser.json');
  var cosRestrictionsObject = getJSONFixture('huron/json/user/cosRestrictionsObject.json');

  var $stateParams = {
    currentUser: currentUser
  };

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _InternationalDialing_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    Notification = _Notification_;
    InternationalDialing = _InternationalDialing_;
    $q = _$q_;

    spyOn(Notification, 'success');
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
    expect(Notification.success).toHaveBeenCalledWith('internationalDialingPanel.success');
    expect(controller.model.internationalDialingEnabled.value).toEqual('1');
  });
});
