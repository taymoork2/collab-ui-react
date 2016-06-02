'use strict';

describe('Controller: BrandingCtrl', function () {
  var $scope, $controller, controller, $q;
  var Notification, Orgservice, BrandService, WebexClientVersion;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies($rootScope, _$controller_, _$q_, _Notification_, _Orgservice_, _UserListService_, _BrandService_, _FeatureToggleService_, _WebexClientVersion_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
    BrandService = _BrandService_;
    WebexClientVersion = _WebexClientVersion_;
  }

  function initSpies() {
    spyOn(Orgservice, 'getOrg');
    spyOn(BrandService, 'getLogoUrl').and.returnValue($q.when('logoUrl'));
    spyOn(WebexClientVersion, 'getWbxClientVersions').and.returnValue($q.when());
    spyOn(WebexClientVersion, 'getPartnerIdGivenOrgId').and.returnValue($q.when());
    spyOn(WebexClientVersion, 'getTemplate').and.returnValue($q.when());
  }

  function initController() {
    controller = $controller('PartnerProfileCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }

});
