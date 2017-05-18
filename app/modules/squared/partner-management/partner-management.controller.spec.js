'use strict';

/* eslint-disable */

describe('PartnerManagementController:', function () {
  beforeEach(angular.mock.module(
    require('./index').default
  ));

  var $controller;
  var $q
  var $scope;
  var svc;
  var $state;
  var ctrl;
  var Notification;

  // TODO: switch this over to using `this.*()` methods for dependency injection
  afterEach(function () {
    $controller = $q = $scope = svc = $state = ctrl = Notification = undefined;
  });

  beforeEach(inject (function (_$controller_, _$q_, _$rootScope_, _$state_,
    _Notification_, _PartnerManagementService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;

    Notification = _Notification_;
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
      orgId: '123',
      numOfSubscription: 1,
      numOfManagedOrg: 2,
      numOfUsers: 3,
      overMaxUserQuerySize: true,
      createdDate: '2015-06-05T20:31:08.925Z',
      claimedDomains: [
        'adomain.na', 'cdomain.na', 'bdomain.na',
      ],
      fullAdmins: [
        {
          firstName: 'Abe',
          lastName: 'Adams',
          displayName: 'Abe Adams',
          primaryEmail: 'abe@cisco.na'
        },
        {
          lastName: 'Collaboration',
          displayName: 'Collab',
          primaryEmail: 'collab@cisco.na'
        },
        {
          firstName: 'Charlie',
          lastName: 'Charms',
          displayName: 'Charlie Charms',
          primaryEmail: 'charlie@cisco.na'
        },
        {
          firstName: 'Betty',
          lastName: 'Burns',
          displayName: 'Betty Burns',
          primaryEmail: 'betty@cisco.na'
        },
      ]
    };
  }

  function getOrgDetailsString() {
    return '[{"label":"partnerManagement.orgDetails.createDate","value":""},' +
      '{"label":"partnerManagement.orgDetails.activeSubs","value":0},{"label":' +
      '"partnerManagement.orgDetails.managedCusts","value":2},{"label":' +
      '"partnerManagement.orgDetails.domains","value":"adomain.na, bdomain.na, cdomain.na"},' +
      '{"label":"partnerManagement.orgDetails.users","value":3},{"label":' +
      '"partnerManagement.orgDetails.admins","value":"Abe Adams, Betty Burns, Charlie Charms, Collab"},' +
      '{"label":"partnerManagement.orgDetails.orgId","value":"123"}]';
  }

  describe('wizard steps,', function () {
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
      // Until we have a real solution to GC issues...
      d = undefined;
    });

    // SEARCH API
    describe('search API', function() {
      it('should go to orgExists when search returns EMAIL_ADDRESS', function () {
        spyOn(svc, 'search').and.returnValue($q.when({
          status: 200,
          data: { orgMatchBy: 'EMAIL_ADDRESS',
                  organizations: [{ orgId: '123', displayName: 'test name', }] },
        }));
        $scope.vm.search();
        $scope.$apply();
        expect($state.go).toHaveBeenCalledWith('partnerManagement.orgExists');
        $scope.vm.data.orgDetails[0].value = ''; // blank out date due to locale issues
        expect(JSON.stringify($scope.vm.data.orgDetails)).toEqual(getOrgDetailsString());
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

      it('should go to searchResults when search returns DOMAIN', function () {
        spyOn(svc, 'search').and.returnValue($q.when({
          status: 200,
          data: { orgMatchBy: 'DOMAIN',
                  organizations: [{ orgId: '123', displayName: 'test name', }] },
        }));
        $scope.vm.search();
        $scope.$apply();
        expect($state.go).toHaveBeenCalledWith('partnerManagement.searchResults');
      });

      it('should go to create when search returns NO_MATCH', function () {
        spyOn(svc, 'search').and.returnValue($q.when({
          status: 200,
          data: { orgMatchBy: 'NO_MATCH',
                  organizations: [{ orgId: '123', displayName: 'test name', }] },
        }));
        $scope.vm.search();
        $scope.$apply();
        expect($state.go).toHaveBeenCalledWith('partnerManagement.create');
      });

      describe('(error cases)', function () {
        beforeEach( function () {
          spyOn(Notification, 'errorWithTrackingId');
        });

        it('should show error on invalid orgMatchBy value', function () {
          spyOn(svc, 'search').and.returnValue($q.when({
            status: 200,
            data: { orgMatchBy: 'INVALID',
                    organizations: [{ orgId: '123', displayName: 'test name', }] },
          }));
          $scope.vm.search();
          $scope.$apply();
          expect(Notification.errorWithTrackingId).toHaveBeenCalled();
        });

        it('should show error when search does not return 200', function () {
          spyOn(svc, 'search').and.returnValue($q.reject({ status: 400, }));
          $scope.vm.search();
          $scope.$apply();
          expect(Notification.errorWithTrackingId).toHaveBeenCalled();
        });
      });
    });

    // CREATE API
    describe('create API', function () {
      beforeEach( function () {
        $scope.vm.data = makeFormData();
        $scope.$$childHead = {
          createForm: { name: { $validate: function () { return true; }, }}
        };
      });

      it('should show got to createSuccess on successful resp', function () {
        spyOn(svc, 'create').and.returnValue($q.when({ status: 200, }));
        $scope.vm.create();
        $scope.$apply();
        expect($state.go).toHaveBeenCalledWith('partnerManagement.createSuccess');
      });

      describe('(error cases)', function () {
        beforeEach( function () {
          spyOn(Notification, 'errorWithTrackingId');
        });

        it('should invalidate form on duplicate name', function () {
          spyOn(svc, 'create').and.returnValue($q.reject({ status: 409,
            data: { message: 'Organization ' + $scope.vm.data.name +
              ' already exists in CI' }}));
          $scope.vm.create();
          $scope.$apply();
          expect($scope.vm.duplicateName).toBe($scope.vm.data.name);
        });

        it ('should show error when create fails', function () {
          spyOn(svc, 'create').and.returnValue($q.reject({ status: 504, }));
          $scope.vm.create();
          $scope.$apply();
          expect(Notification.errorWithTrackingId).toHaveBeenCalled();
        })
      });
    })
  });
});
