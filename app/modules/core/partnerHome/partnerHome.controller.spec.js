'use strict';

describe('Controller: PartnerHomeCtrl', function () {
  var $scope, $q, PartnerService;

  var trialsListFixture = getJSONFixture('core/json/partner/trialsResponse.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));

  var authInfo = {
    isCustomerPartner: true
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($rootScope, $controller, _PartnerService_, _$q_) {
    $scope = $rootScope.$new();
    PartnerService = _PartnerService_;
    $q = _$q_;

    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };

    spyOn(PartnerService, 'getTrialList').and.returnValue($q.when(trialsListFixture));

    $controller('PartnerHomeCtrl', {
      $scope: $scope
    });

  }));

  describe('PartnerHomeCtrl controller', function () {
    // lol no existing tests actually cover this controller
  });

});
