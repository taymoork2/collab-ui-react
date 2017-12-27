'use strict';

describe('Controller: CustomerOverviewCtrl', function () {
  var $controller, $scope, $stateParams, $state, $window, $q, modal, Authinfo, BrandService, controller, currentCustomer, FeatureToggleService, identityCustomer, Orgservice, PartnerService, TrialService, Userservice, Notification;

  var licenseString = 'MC_cfb817d0-ddfe-403d-a976-ada57d32a3d7_100_t30citest.webex.com';

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(function ($rootScope, _$controller_, _$stateParams_, _$state_, _$window_, _$q_, _$modal_, _Authinfo_, _BrandService_, _FeatureToggleService_, _Notification_, _Orgservice_, _PartnerService_, _TrialService_, _Userservice_) {
    $scope = $rootScope.$new();
    currentCustomer = {
      customerEmail: 'testuser@gmail.com',
      customerOrgId: '123-456',
      licenseList: [{
        licenseId: licenseString,
        offerName: 'MC',
        licenseType: 'CONFERENCING',
        siteUrl: 't30citest.webex.com',
      }, {
        licenseId: 'ST_04b1c66d-9cb7-4280-bd0e-cfdb763fbdc6',
        offerName: 'ST',
        licenseType: 'STORAGE',
      }],
    };
    identityCustomer = {
      services: ['webex-squared', 'ciscouc'],
    };

    Authinfo = _Authinfo_;
    BrandService = _BrandService_;
    FeatureToggleService = _FeatureToggleService_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
    PartnerService = _PartnerService_;
    TrialService = _TrialService_;
    Userservice = _Userservice_;

    $stateParams = _$stateParams_;
    $stateParams.currentCustomer = currentCustomer;
    $state = _$state_;
    $window = _$window_;
    $q = _$q_;
    modal = _$modal_;
    $controller = _$controller_;

    $state.modal = {
      result: $q.resolve(),
    };

    spyOn(Authinfo, 'getPrimaryEmail').and.returnValue('xyz123@gmail.com');
    spyOn(Authinfo, 'getOrgId').and.returnValue('1A2B3C4D');
    spyOn(Authinfo, 'getOrgName').and.returnValue('xyz123');
    spyOn(Authinfo, 'isPartnerAdmin').and.returnValue(true);
    spyOn(Authinfo, 'getUserId').and.returnValue('D4C3B2A1');
    spyOn(Authinfo, 'getUserOrgId').and.returnValue('1A2B3C4D');
    spyOn(Authinfo, 'isCare').and.returnValue(true);
    spyOn(Notification, 'errorWithTrackingId');
    spyOn($state, 'go').and.returnValue($q.resolve());
    spyOn($state, 'href').and.callThrough();
    spyOn($window, 'open');
    spyOn(Userservice, 'updateUsers').and.callFake(function (usersDataArray, licenses, entitlements, method, callback) {
      callback();
    });
    spyOn(BrandService, 'getSettings').and.returnValue($q.resolve({}));
    spyOn(TrialService, 'getTrial').and.returnValue($q.resolve({}));
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(getJSONFixture('core/json/organizations/Orgservice.json').getOrg, 200);
    });
    spyOn(Orgservice, 'isSetupDone').and.returnValue($q.resolve(false));
    spyOn(Orgservice, 'isTestOrg').and.returnValue($q.resolve(true));
    spyOn(PartnerService, 'modifyManagedOrgs').and.returnValue($q.resolve({}));
    spyOn($window, 'confirm').and.returnValue(true);
    spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasCareInboundTrialsGetStatus').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasITProPackGetStatus').and.returnValue($q.resolve(true));
    spyOn(modal, 'open').and.callThrough();
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasJira2126UseAltEndpointGetStatus').and.returnValue($q.resolve(false));
    spyOn(FeatureToggleService, 'hI1635GetStatus').and.returnValue($q.resolve(false));
    spyOn(PartnerService, 'updateOrgForCustomerView').and.returnValue($q.resolve());
    initController();
  }));

  function initController() {
    controller = $controller('CustomerOverviewCtrl', {
      $scope: $scope,
      identityCustomer: identityCustomer,
    });

    $scope.$apply();
  }

  afterEach(function () {
    $controller = $scope = $stateParams = $state = $window = $q = modal = Authinfo = BrandService = controller = currentCustomer = FeatureToggleService = identityCustomer = Orgservice
    = PartnerService = TrialService = Userservice = Notification = undefined;
  });

  xit('should transition to trialEdit.info state', function () {
    controller.openEditTrialModal();
    expect($state.go).toHaveBeenCalled();
    expect($state.go.calls.mostRecent().args[0]).toBe('trialEdit.info');

    $state.go.calls.reset();

    $scope.$apply(); // modal is closed and promise is resolved
    expect($state.go).toHaveBeenCalled();
    expect($state.go.calls.mostRecent().args[0]).toBe('partnercustomers.list');
  });

  it('should check the customer org id to see if it is a test org', function () {
    expect(Orgservice.isTestOrg).toHaveBeenCalledWith('123-456');
  });

  it('should display correct customer portal launch button via var isOrgSetup', function () {
    // isOrgSetup is false from spyOn in beforeEach
    expect(controller.isOrgSetup).toBe(false);
    Orgservice.isSetupDone.and.returnValue($q.resolve(true));
    initController();
    expect(controller.isOrgSetup).toBe(true);
    Orgservice.isSetupDone.and.returnValue($q.reject());
    initController();
    expect(controller.isOrgSetup).toBe(null);
    Orgservice.isSetupDone.and.returnValue($q.resolve(false));
    initController();
    expect(controller.isOrgSetup).toBe(false);
  });

  it('should display number of days left', function () {
    expect(controller.getDaysLeft(1)).toBe('customerPage.daysLeft');
    expect(controller.getDaysLeft(0)).toBe('customerPage.expiresToday');
    expect(controller.getDaysLeft(-1)).toBe('customerPage.expired');
  });

  it('should set the isSquaredUC flag based on services', function () {
    expect(controller.isSquaredUC).toBe(true);
  });


  describe('launchCustomerPortal', function () {
    beforeEach(function () {
      Userservice.updateUsers.and.returnValue($q.resolve());
    });

    describe('using an old patch flow', function () {
      describe('as a full-admin', function () {
        beforeEach(function () {
          spyOn(controller._helpers, 'canUpdateLicensesForSelf').and.returnValue(true);
          controller.launchCustomerPortal();
          $scope.$apply();
        });

        it('should call modifyManagedOrgs', function () {
          expect(controller.customerOrgId).toBe(currentCustomer.customerOrgId);
          expect(Authinfo.isPartnerAdmin()).toBe(true);
          expect(PartnerService.modifyManagedOrgs).toHaveBeenCalled();
        });

        it('should create proper url', function () {
          expect($state.href).toHaveBeenCalledWith('login', {
            customerOrgId: controller.currentCustomer.customerOrgId,
          });
        });

        it('should call $window.open', function () {
          expect($window.open).toHaveBeenCalled();
        });
      });

      describe('as a non-full-admin', function () {
        beforeEach(function () {
          controller.isPartnerAdmin = false;
          spyOn(controller._helpers, 'canUpdateLicensesForSelf').and.returnValue(false);
          spyOn(controller._helpers, 'openCustomerPortal');
          controller.launchCustomerPortal();
          $scope.$apply();
        });

        it('should not call "modifyManagedOrgs()"', function () {
          expect(PartnerService.modifyManagedOrgs).not.toHaveBeenCalled();
        });

        it('should call "openCustomerPortal()"', function () {
          expect(controller._helpers.openCustomerPortal).toHaveBeenCalled();
        });
      });
    });

    describe('using an new flow', function () {
      beforeEach(function () {
        FeatureToggleService.atlasJira2126UseAltEndpointGetStatus.and.returnValue($q.resolve(true));
        initController();
        controller.launchCustomerPortal();
        $scope.$apply();
      });
      it('should call the api to do the patching', function () {
        expect(PartnerService.updateOrgForCustomerView).toHaveBeenCalled();
      });
    });
  });

  describe('launchCustomerPortal error', function () {
    beforeEach(function () {
      PartnerService.modifyManagedOrgs.and.returnValue($q.reject(400));
      Userservice.updateUsers.and.returnValue($q.resolve());
      controller.launchCustomerPortal();
      $scope.$apply();
    });

    it('should cause a Notification if modifyManagedOrgs returns 400', function () {
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('should call deleteOrg successfully', function () {
    it('should call deleteTestOrg', function () {
      controller.deleteTestOrg();
      expect(modal.open).toHaveBeenCalled();
    });
  });

  describe('atlasCareTrialsGetStatus should be called', function () {
    it('should have called FeatureToggleService.atlasCareTrialsGetStatus', function () {
      expect(FeatureToggleService.atlasCareTrialsGetStatus).toHaveBeenCalled();
    });
  });

  describe('atlasCareTrialsGetStatus should be called', function () {
    it('should have called FeatureToggleService.atlasCareTrialsGetStatus', function () {
      expect(FeatureToggleService.atlasCareInboundTrialsGetStatus).toHaveBeenCalled();
    });
  });
});
