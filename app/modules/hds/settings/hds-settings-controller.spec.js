'use strict';

describe('Controller: HDSSettingsController', function () {
  var $controller, $q, $scope, controller, Authinfo, Orgservice, HDSService, FusionClusterService;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('HDS'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _Authinfo_, _Orgservice_, _HDSService_, _FusionClusterService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();
    Authinfo = _Authinfo_;
    Orgservice = _Orgservice_;
    HDSService = _HDSService_;
    FusionClusterService = _FusionClusterService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'getOrgId').and.returnValue('123456');
    HDSService.getHdsTrialUsers = sinon.stub().returns($q.resolve({}));
    FusionClusterService.getAll = sinon.stub().returns($q.resolve({}));
  }

  function initController() {
    controller = $controller('HDSSettingsController', {
      $scope: $scope,
      Orgservice: Orgservice,
      HDSService: HDSService,
      FusionClusterService: FusionClusterService,
    });
    $scope.$apply();
  }

  describe('HDS Trial Mode: ', function () {
    beforeEach(function () {
      spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
        callback({
          success: true,
          orgSettings: {
            "kmsServer": "partner.com",
            "kmsServerMachineUUID": "ded8327b-518d-4694-a219-ca7db5bfc2db",
            "adrServer": "dc5b76db-ccb8-4c36-b734-c3f443f7bec6",
            "securityService": "0d61621d-113d-4936-8869-2f264b174b55",
            "altHdsServers": [
              {
                "type": "kms",
                "kmsServer": "customer.com",
                "kmsServerMachineUUID": "e336ae2b-7afb-4e90-a023-61103e06a861",
                "groupId": "755d989a-feef-404a-8669-085eb054afef",
                "active": true,
              },
              {
                "type": "adr",
                "adrServer": "5f40d7be-da6b-4a10-9c6c-8b061aee053a",
                "groupId": "755d989a-feef-404a-8669-085eb054afef",
                "active": true,
              },
              {
                "type": "sec",
                "securityService": "2d2bdeaf-3e63-4561-be2f-4ecc1a48dcd4",
                "groupId": "755d989a-feef-404a-8669-085eb054afef",
                "active": true,
              },
            ],
          },
        }, 200);
      });
      initController();
    });

    it('controller should be defined', function () {
      expect(controller).toBeDefined();
    });

    it('HDS mode, production/trial domains, ...', function () {
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
            "kmsServer": "partner.com",
            "kmsServerMachineUUID": "ded8327b-518d-4694-a219-ca7db5bfc2db",
            "adrServer": "dc5b76db-ccb8-4c36-b734-c3f443f7bec6",
            "securityService": "0d61621d-113d-4936-8869-2f264b174b55",
          },
        }, 200);
      });
      initController();
    });

    it('HDS mode, production/trial domains', function () {
      expect(controller.model.serviceMode).toBe(controller.PRODUCTION);
      expect(controller.prodDomain).toBe('partner.com');
    });
  });
});

