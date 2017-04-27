'use strict';

fdescribe('Controller: PartnerManagementController', function () {
  beforeEach(angular.mock.module('Squared'));

  var $scope;
  var ctrl;
  var svc;

  beforeEach(inject(function (_$controller_, _$rootScope_, _PartnerManagementService_ ) {
    $scope = _$rootScope_.$new();
    ctrl = _$controller_;
    svc = _PartnerManagementService_;
  }));

  function getFormData() {
    return {
        email: 'test@cisco.com',
        confirmEmail: 'test@cisco.com',
        name: 'Test Company',
        confirmName: 'Test Company',
        partnerType: 'DISTI',
        lifeCyclePartner: false,
      };
  }

  it('should initialize data', function () {
    var d = _.clone($scope.vm.data);
    $scope.vm.data = getFormData();
    expect(JSON.stringify(d) === JSON.stringify($scope.vm.data)).toBe(false);
    ctrl.initData();
    expect(JSON.stringify(d) === JSON.stringify($scope.vm.data)).toBe(true);
  });
});
