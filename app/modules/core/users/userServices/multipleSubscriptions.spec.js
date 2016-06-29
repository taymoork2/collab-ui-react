'use strict';

describe('MultipleSubscriptionsCtrl: Ctrl', function () {
  var $scope, $httpBackend, controller, $q, Orgservice;
  var getLicensesUsage;
  var $controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$httpBackend_, _$q_, _Orgservice_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    Orgservice = _Orgservice_;

    getLicensesUsage = getJSONFixture('core/json/organizations/Orgservice.json').getLicensesUsage;
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when());

  }));

  function initController() {
    controller = $controller('MultipleSubscriptionsCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('MultipleSubscriptionsCtrl controller', function () {

    describe('for single subscriptions', function () {
      beforeEach(function () {
        Orgservice.getLicensesUsage.and.returnValue($q.when(getLicensesUsage.singleSub));
        initController();
      });

      it('should verify that there is one subscriptionId', function () {
        expect(Orgservice.getLicensesUsage).toHaveBeenCalled();
        expect(controller.oneBilling).toEqual(true);
        expect(controller.subscriptionOptions).toEqual(['srvcid-integ-uitest-1a']);
        expect(controller.showLicenses('srvcid-integ-uitest-1a', false)).toEqual(true);
      });
    });

    describe('for multiple subscriptions', function () {
      beforeEach(function () {
        Orgservice.getLicensesUsage.and.returnValue($q.when(getLicensesUsage.multiSub));
        initController();
      });

      it('should verify that there are multiple subscriptionIds', function () {
        expect(controller.oneBilling).toEqual(false);
        expect(controller.subscriptionOptions).toEqual(['svcid-integ-sunnyway-1a', 'svcid-integ-sunnyway-1']);
        expect(controller.selectedSubscription).toEqual('svcid-integ-sunnyway-1a');
        expect(controller.showLicenses('svcid-integ-sunnyway-1a', false)).toEqual(true);
      });

    });

    describe('for trial subscriptions', function () {
      beforeEach(function () {
        Orgservice.getLicensesUsage.and.returnValue($q.when(getLicensesUsage.trialSub));
        initController();
      });

      it('should verify there is a trial subscription', function () {
        expect(controller.oneBilling).toEqual(false);
        expect(controller.showLicenses('', true)).toEqual(true);
      });
    });

  });
});
