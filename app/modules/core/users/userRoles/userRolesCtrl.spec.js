'use strict';

describe('Controller: UserRolesCtrl', function () {
  var controller, rootScope, $scope, $stateParams, Authinfo, Config, Orgservice, Userservice, $q, $controller, Notification, SyncService;
  var currentUser = angular.copy(getJSONFixture('core/json/sipTestFakeUser.json'));

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Squared'));
  beforeEach(module('Hercules'));
  beforeEach(module('Messenger'));

  beforeEach(inject(function ($rootScope, _$stateParams_, _$controller_, _Authinfo_, _Notification_, _Config_, _$q_, _Orgservice_, _Userservice_, _SyncService_) {
    $scope = $rootScope.$new();
    rootScope = $rootScope;
    Orgservice = _Orgservice_;
    Config = _Config_;
    $controller = _$controller_;
    Notification = _Notification_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    Userservice = _Userservice_;
    SyncService = _SyncService_;
    $stateParams = _$stateParams_;
    $stateParams.currentUser = currentUser;

    spyOn(Authinfo, 'getOrgId').and.returnValue('we23f24-4f3f4f-cc7af705-6583-32r3r23r');
    spyOn(Authinfo, 'getUserId').and.returnValue('cc7af705-6583-4f58-b0b6-ea75df64da7e');
    spyOn(Orgservice, 'getOrgCacheOption').and.callFake(function (callback) {
      callback({});
    });
  }));

  function initController() {
    controller = $controller('UserRolesCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }

  describe('UserRolesCtrl Initialization: ', function () {
    beforeEach(initController);

    it('should initialize the UserRolesCtrl controller', function () {
      expect(controller).toBeDefined();
    });
  });

  describe('Setting of user SIP Address: ', function () {
    beforeEach(initController);

    it('should set type cloud-calling and primary SIP Address to $scope.sipAddr', function () {
      expect($scope.sipAddr).toEqual('fakegmuser+siptestuser150@atlastesting234.ciscospark.com');
    });
  });

  describe('Setting of user SIP Address for another user: ', function () {
    beforeEach(initController);

    it('should set type cloud-calling SIP Address to $scope.sipAddr', function () {
      $scope.currentUser = angular.copy(getJSONFixture('core/json/sipTestFakeUser2.json'));
      $scope.setUserSipAddress();
      expect($scope.sipAddr).toEqual('fakegmuser+siptestuser786@atlastesting234.ciscospark.com');
    });
  });
});
