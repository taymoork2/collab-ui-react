'use strict';

/* eslint-disable */

describe('Controller: PartnerManagementController', function () {
  beforeEach(angular.mock.module('Squared'));

  var $controller;
  var $q
  var $scope;
  var svc;
  var $state;
  var ctrl;

  beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _$state_, _PartnerManagementService_ ) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    svc = _PartnerManagementService_;
  }));

  function initController() {
    ctrl = $controller('PartnerManagementController', {
      $scope: $scope,
      $state: $state,
      PartnerManagementService: svc,
    });
  }

  function makeFormData() {
    return {
      email: 'test@cisco.com',
      confirmEmail: 'test@cisco.com',
      name: 'Test Company',
      confirmName: 'Test Company',
      partnerType: 'DISTI',
      lifeCyclePartner: false,
    };
  }

  function makeOrgDetails() {
    return {
      "orgId": "123",
      "numOfSubscription": 1,
      "numOfManagedOrg": 2,
      "numOfUsers": 3,
      "overMaxUserQuerySize": true,
      "createdDate": "2015-06-05T20:31:08.925Z",
      "claimedDomains": [
        "adomain.na", "cdomain.na", "bdomain.na",
      ],
      "fullAdmins": [
        {
          "firstName": "Abe",
          "lastName": "Adams",
          "displayName": "Abe Adams",
          "primaryEmail": "abe@cisco.na"
        },
        {
          "lastName": "Collaboration",
          "displayName": "Collab",
          "primaryEmail": "collab@cisco.na"
        },
        {
          "firstName": "Charlie",
          "lastName": "Charms",
          "displayName": "Charlie Charms",
          "primaryEmail": "charlie@cisco.na"
        },
        {
          "firstName": "Betty",
          "lastName": "Burns",
          "displayName": "Betty Burns",
          "primaryEmail": "betty@cisco.na"
        },
      ]
    };
  }

  describe('wizard steps', function () {
    beforeEach( function() {
      initController();
      spyOn($state, 'go');
      spyOn(svc, 'getOrgDetails').and.returnValue($q.when({
        status: 200,
        data: makeOrgDetails(),
      }));
    });

    it('should clear data when startOver is called', function () {
      var d = _.clone($scope.vm.data);
      $scope.vm.data = makeFormData();
      expect(JSON.stringify(d) === JSON.stringify($scope.vm.data)).toBe(false);
      $scope.vm.startOver();
      expect(JSON.stringify(d) === JSON.stringify($scope.vm.data)).toBe(true);
    });

    it('should go to orgExists when search returns EMAIL_ADDRESS', function () {
      spyOn(svc, 'search').and.returnValue($q.when({
        status: 200,
        data: { orgMatchBy: 'EMAIL_ADDRESS',
                organizations: [{ orgId: '123', displayName: 'test name', }] },
      }));
      $scope.vm.search();
      $scope.$apply();
      expect($state.go).toHaveBeenCalledWith('partnerManagement.orgExists');
    });

    it('should go to orgClaimed when search returns DOMAIN_CLAIMED', function () {
      spyOn(svc, 'search').and.returnValue($q.when({
        status: 200,
        data: { orgMatchBy: 'DOMAIN_CLAIMED',
                organizations: [{ orgId: '123', displayName: 'test name', }] },
      }));
      $scope.vm.search();
      $scope.$apply();
      expect($state.go).toHaveBeenCalledWith('partnerManagement.orgClaimed');
    });
  });
});
