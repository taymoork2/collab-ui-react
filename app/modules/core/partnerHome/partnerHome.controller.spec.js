'use strict';

describe('Controller: PartnerHomeCtrl', function () {
  var $scope, $q, controller, PartnerService;

  var adminJSONFixture = getJSONFixture('core/json/organizations/adminServices.json');
  var trialsListFixture = getJSONFixture('core/json/partner/trialsResponse.json');

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  var authInfo = {
    isCustomerPartner: true
  };

  beforeEach(module(function ($provide) {
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

    controller = $controller('PartnerHomeCtrl', {
      $scope: $scope
    });

  }));

  describe('PartnerHomeCtrl controller', function () {
    // lol no existing tests actually cover this controller
  });

});
