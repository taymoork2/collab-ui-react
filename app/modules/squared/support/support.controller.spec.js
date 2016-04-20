'use strict';

describe('Controller: SupportCtrl', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Squared'));

  var controller, Authinfo, Userservice, currentUser, Config, $scope;
  var roles = ["ciscouc.devsupport", "atlas-portal.support"];
  var user = {
    'success': true,
    'roles': roles
  };

  beforeEach(inject(function ($rootScope, $controller, _Userservice_, _Authinfo_, _Config_) {
    Userservice = _Userservice_;
    Authinfo = _Authinfo_;
    Config = _Config_;

    currentUser = {
      success: true,
      roles: ['ciscouc.devops', 'ciscouc.devsupport']
    };

    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(currentUser, 200);
    });
    spyOn(Authinfo, 'isCiscoMock').and.returnValue(true);
    spyOn(Config, 'isProd').and.returnValue(false);

    $scope = $rootScope.$new();
    Userservice = Userservice;
    controller = $controller('SupportCtrl', {
      $scope: $scope,
      Authinfo: Authinfo,
      Userservice: Userservice,
      Config: Config
    });
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('should show CdrCallFlowLink for user has devsupport or devops role', function () {
    $scope.initializeShowCdrCallFlowLink();
    expect($scope.showCdrCallFlowLink).toEqual(true);
  });

  it('should return cisdoDevRole true for user that has devsupport or devops role', function () {
    var isSupportRole = $scope.isCiscoDevRole(roles);
    expect(isSupportRole).toBe(true);
  });
});
