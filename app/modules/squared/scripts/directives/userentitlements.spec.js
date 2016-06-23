(function () {
  'use strict';

  describe('Controller: UserEntitlementsCtrl', function () {
    var controller, $controller, $rootScope, $scope, Userservice, Authinfo, currentUser, services;

    beforeEach(module('Squared'));
    beforeEach(module('Huron'));
    beforeEach(module('Sunlight'));

    beforeEach(inject(function (_$rootScope_, _$controller_, _Userservice_, _Authinfo_) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      Userservice = _Userservice_;
      Authinfo = _Authinfo_;

      currentUser = getJSONFixture('squared/json/currentUser.json');
      services = getJSONFixture('squared/json/services.json');

      $scope = $rootScope.$new();
      $scope.currentUser = currentUser;
      $scope.service = 'MESSAGING';

      spyOn(Authinfo, 'hasAccount').and.returnValue(true);
      spyOn(Authinfo, 'getServices').and.returnValue(services);
      spyOn(Userservice, 'updateUsers');

      controller = $controller('UserEntitlementsCtrl', {
        $scope: $scope
      });
      $scope.$apply();
    }));

    it('should update users entitlements with only configurable entitlements', function () {
      $scope.changeEntitlement(currentUser);
      $scope.$apply();

      expect(Userservice.updateUsers).toHaveBeenCalledWith(jasmine.any(Array), null, [{
        entitlementName: 'messengerInterop',
        entitlementState: 'INACTIVE'
      }], 'changeEntitlement', jasmine.any(Function));
    });

    it('should get the display name from services array', function () {
      expect($scope.getServiceName('messengerInterop')).toEqual('Messenger interop');
    });

  });

})();
