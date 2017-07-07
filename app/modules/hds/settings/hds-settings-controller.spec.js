'use strict';

describe('Controller: HDSSettingsController', function () {
  var $controller, $q, $scope, controller, Authinfo, Orgservice, HDSService, HybridServicesClusterService;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('HDS'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _Authinfo_, _Orgservice_, _HDSService_, _HybridServicesClusterService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();
    Authinfo = _Authinfo_;
    Orgservice = _Orgservice_;
    HDSService = _HDSService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'getOrgId').and.returnValue('123456');
    spyOn(HDSService, 'getHdsTrialUsers').and.returnValue($q.resolve({}));
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve({}));
  }

  function initController() {
    controller = $controller('HDSSettingsController', {
      $scope: $scope,
      Orgservice: Orgservice,
      HDSService: HDSService,
      HybridServicesClusterService: HybridServicesClusterService,
    });
    $scope.$apply();
  }
  describe('HDS Trial Mode: ', function () {
    beforeEach(function () {
      spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
        callback({
          success: true,
          orgSettings: {
            kmsServer: 'partner.com',
            kmsServerMachineUUID: 'ded8327b-518d-4694-a219-ca7db5bfc2db',
            adrServer: 'dc5b76db-ccb8-4c36-b734-c3f443f7bec6',
            securityService: '0d61621d-113d-4936-8869-2f264b174b55',
            altHdsServers: [
              {
                type: 'kms',
                kmsServer: 'customer.com',
                kmsServerMachineUUID: 'e336ae2b-7afb-4e90-a023-61103e06a861',
                groupId: '755d989a-feef-404a-8669-085eb054afef',
                active: true,
              },
              {
                type: 'adr',
                adrServer: '5f40d7be-da6b-4a10-9c6c-8b061aee053a',
                groupId: '755d989a-feef-404a-8669-085eb054afef',
                active: true,
              },
              {
                type: 'sec',
                securityService: '2d2bdeaf-3e63-4561-be2f-4ecc1a48dcd4',
                groupId: '755d989a-feef-404a-8669-085eb054afef',
                active: true,
              },
            ],
          },
        }, 200);
      });
      initController();
    });

    it('controller should be initialized, parse the right values from org settings with HDS trial mode', function () {
      expect(controller).toBeDefined();
      expect(controller.model.serviceMode).toBe(controller.TRIAL);
      expect(controller.trialDomain).toBe('customer.com');
      expect(controller.prodDomain).toBe('partner.com');
      expect(controller.trialUserGroupId).toBe('755d989a-feef-404a-8669-085eb054afef');
    });
  });

  describe('HDS Production Mode: ', function () {
    beforeEach(function () {
      spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
        callback({
          success: true,
          orgSettings: {
            kmsServer: 'partner.com',
            kmsServerMachineUUID: 'ded8327b-518d-4694-a219-ca7db5bfc2db',
            adrServer: 'dc5b76db-ccb8-4c36-b734-c3f443f7bec6',
            securityService: '0d61621d-113d-4936-8869-2f264b174b55',
          },
        }, 200);
      });
      initController();
    });

    it('controller should parse the right values from org settings with HDS production mode', function () {
      expect(controller.model.serviceMode).toBe(controller.PRODUCTION);
      expect(controller.prodDomain).toBe('partner.com');
    });
  });


  describe('HDS Dirsync: ', function () {
    beforeEach(function () {
      spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
        callback({
          success: true,
          dirsyncEnabled: true,
          orgSettings: {
            altHdsServers: [
              {
                type: 'kms',
                kmsServer: 'customer.com',
                kmsServerMachineUUID: 'e336ae2b-7afb-4e90-a023-61103e06a861',
                active: false,
              },
              {
                type: 'adr',
                adrServer: '5f40d7be-da6b-4a10-9c6c-8b061aee053a',
                active: false,
              },
              {
                type: 'sec',
                securityService: '2d2bdeaf-3e63-4561-be2f-4ecc1a48dcd4',
                active: false,
              },
            ],
          },
        }, 200);
      });

      var group = {
        Resources: [{
          id: '123',
        },
        ],
      };

      spyOn(HDSService, 'queryGroup').and.returnValue($q.resolve(group));
      spyOn(HDSService, 'setOrgAltHdsServersHds').and.returnValue($q.resolve());
      initController();
    });

    it('controller should call have default group id set for all servers in the trial', function () {
      expect(controller.model.serviceMode).toBe(controller.PRE_TRIAL);
      expect(HDSService.queryGroup).toHaveBeenCalled();
      expect(HDSService.setOrgAltHdsServersHds).toHaveBeenCalled();
      expect(controller.trialUserGroupId).toBe('123');
      expect(controller.altHdsServers).toBeDefined();
      _.forEach(controller.altHdsServers, function (server) {
        expect(server.groupId).toBe('123');
      });
    });
  });
});

