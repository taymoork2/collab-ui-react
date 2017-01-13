'use strict';

describe('Controller: PstnToSCtrl', function () {
  var $q, $rootScope, $scope, $controller, controller, Orgservice, PstnSetupService;

  beforeEach(angular.mock.module('Huron'));

  afterAll(function () {
    $q = $rootScope = $scope = $controller = controller = Orgservice = PstnSetupService = undefined;
  });

  beforeEach(inject(function (_$q_, _$rootScope_, _$controller_, _Orgservice_, _PstnSetupService_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    Orgservice = _Orgservice_;
    PstnSetupService = _PstnSetupService_;

    $scope.$close = jasmine.createSpy('$close');

    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({ id: '1234512345' }, 200);
    });

    spyOn(PstnSetupService, 'getCustomerV2').and.returnValue($q.when({ trial: true }));
    spyOn(PstnSetupService, 'getCustomerTrialV2').and.returnValue($q.when({ termsOfServiceUrl: 'http://server/tos' }));
    spyOn(PstnSetupService, 'setCustomerTrialV2').and.returnValue($q.when());

    controller = $controller('PstnToSCtrl', {
      $scope: $scope,
      Orgservice: Orgservice,
      PstnSetupService: PstnSetupService
    });
    $rootScope.$apply();
  }));

  it('should accept the Terms of Service', function () {
    controller.firstName = 'fname';
    controller.lastName = 'lname';
    controller.email = 'flname@company.com';

    controller.onAgreeClick();
    expect(controller.loading).toEqual(true);
    expect(PstnSetupService.setCustomerTrialV2).toHaveBeenCalled();

    $rootScope.$apply();
    expect($scope.$close).toHaveBeenCalled();
  });

});
