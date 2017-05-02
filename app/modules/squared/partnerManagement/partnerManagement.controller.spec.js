'use strict';

/* eslint-disable */

describe('Controller: PartnerManagementController', function () {
  beforeEach(angular.mock.module('Squared'));

  var $controller;
  var $scope;
  var $service;
  var $state;
  var ctrl;

  beforeEach(inject(function (_$controller_, _$rootScope_, _$state_, _PartnerManagementService_ ) {
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    $service = _PartnerManagementService_;

    spyOn($state, 'go');
  }));

  function initController() {
    ctrl = $controller('PartnerManagementController', {
      $scope: $scope,
      $state: $state,
      PartnerManagementService: $service,
    });
  }

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
    initController();
    var d = _.clone($scope.vm.data);
    $scope.vm.data = getFormData();
    expect(JSON.stringify(d) === JSON.stringify($scope.vm.data)).toBe(false);
    $scope.vm.initData();
    expect(JSON.stringify(d) === JSON.stringify($scope.vm.data)).toBe(true);
  });

  describe('wizard steps', function () {
    it('should go to orgExists on EMAIL_ADDRESS match', function () {

    });
  });
});
