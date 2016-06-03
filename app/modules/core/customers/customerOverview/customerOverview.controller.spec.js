'use strict';

describe('Controller: CustomerOverviewCtrl', function () {
  var controller, $scope, $stateParams, $state, $window, $q, modal, Authinfo, BrandService, currentCustomer, FeatureToggleService, identityCustomer, Orgservice, PartnerService, TrialService, Userservice;
  var testOrg;

  function LicenseFeature(name, state) {
    this['id'] = name.toString();
    this['properties'] = null;
    //this['state'] = state ? 'ADD' : 'REMOVE';
  }

  var licenseString = 'MC_cfb817d0-ddfe-403d-a976-ada57d32a3d7_100_t30citest.webex.com';

  beforeEach(module('Core'));

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$stateParams_, _$state_, _$window_, _$q_, _$modal_, _FeatureToggleService_, _Orgservice_, _PartnerService_, _TrialService_) {
    $scope = $rootScope.$new();
    currentCustomer = {
      customerEmail: 'testuser@gmail.com',
      customerOrgId: '123-456',
      licenseList: [{
        licenseId: licenseString,
        offerName: "MC",
        licenseType: "CONFERENCING",
        siteUrl: "t30citest.webex.com"
      }, {
        licenseId: "ST_04b1c66d-9cb7-4280-bd0e-cfdb763fbdc6",
        offerName: "ST",
        licenseType: "STORAGE"
      }]
    };
    identityCustomer = {
      services: ['webex-squared', 'ciscouc']
    };
    Userservice = {
      updateUsers: function () {}
    };
    Authinfo = {
      getPrimaryEmail: function () {
        return "xyz123@gmail.com";
      },
      getOrgId: function () {
        return '1A2B3C4D';
      },
      getOrgName: function () {
        return "xyz123";
      },
      isPartnerAdmin: function () {
        return true;
      }
    };
    BrandService = {
      getSettings: function () {}
    };
    FeatureToggleService = _FeatureToggleService_;
    Orgservice = _Orgservice_;
    PartnerService = _PartnerService_;

    $stateParams = _$stateParams_;
    $stateParams.currentCustomer = currentCustomer;
    $state = _$state_;
    $window = _$window_;
    $q = _$q_;
    modal = _$modal_;

    $state.modal = {
      result: $q.when()
    };

    TrialService = _TrialService_;
    spyOn($state, 'go').and.returnValue($q.when());
    spyOn($state, 'href').and.callThrough();
    spyOn($window, 'open');
    spyOn(Userservice, 'updateUsers').and.callFake(function (usersDataArray, licenses, entitlements, method, callback) {
      callback();
    });
    spyOn(BrandService, 'getSettings').and.returnValue($q.when({}));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(TrialService, 'getTrial').and.returnValue($q.when({}));
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback, orgId) {
      callback(getJSONFixture('core/json/organizations/Orgservice.json').getOrg, 200);
    });
    spyOn(PartnerService, 'modifyManagedOrgs').and.returnValue($q.when({}));
    spyOn($window, 'confirm').and.returnValue(true);
    spyOn(modal, 'open').and.callThrough();

    controller = $controller('CustomerOverviewCtrl', {
      $scope: $scope,
      identityCustomer: identityCustomer,
      Userservice: Userservice,
      Authinfo: Authinfo,
      BrandService: BrandService,
      FeatureToggleService: FeatureToggleService,
      $modal: modal
    });

    $scope.$apply();
  }));

  xit('should transition to trialEdit.info state', function () {
    controller.openEditTrialModal();
    expect($state.go).toHaveBeenCalled();
    expect($state.go.calls.mostRecent().args[0]).toEqual('trialEdit.info');

    $state.go.calls.reset();

    $scope.$apply(); // modal is closed and promise is resolved
    expect($state.go).toHaveBeenCalled();
    expect($state.go.calls.mostRecent().args[0]).toEqual('partnercustomers.list');
  });

  it('should display number of days left', function () {
    expect(controller.getDaysLeft(1)).toEqual(1);
    expect(controller.getDaysLeft(0)).toEqual('customerPage.expiresToday');
    expect(controller.getDaysLeft(-1)).toEqual('customerPage.expired');
  });

  it('should set the isSquaredUC flag based on services', function () {
    expect(controller.isSquaredUC).toEqual(true);
  });

  describe('launchCustomerPortal', function () {
    beforeEach(function () {
      controller.launchCustomerPortal();
      $scope.$apply();
    });

    it('should call modifyManagedOrgs', function () {
      expect(controller.customerOrgId).toBe(currentCustomer.customerOrgId);
      expect(Authinfo.isPartnerAdmin()).toBe(true);
      expect(PartnerService.modifyManagedOrgs).toHaveBeenCalled();
    });

    it('should create proper url', function () {
      expect($state.href).toHaveBeenCalledWith('login_swap', {
        customerOrgId: controller.currentCustomer.customerOrgId,
        customerOrgName: controller.currentCustomer.customerName
      });
    });

    it('should call Userservice.updateUsers with correct license', function () {
      expect(Userservice.updateUsers).toHaveBeenCalledWith([{
          address: "xyz123@gmail.com"
        }], jasmine.any(Array),
        //[new LicenseFeature(licenseString, true)],
        null, 'updateUserLicense', jasmine.any(Function));
    });

    it('should call $window.open', function () {
      expect($window.open).toHaveBeenCalled();
    });
  });

  describe('should call isTestOrg successfully', function () {
    it('should identify as a test org', function () {
      expect(controller.isTest).toBe(true);
    });
  });

  describe('should call deleteOrg successfully', function () {
    it('should call deleteTestOrg', function () {
      controller.deleteTestOrg();
      expect(modal.open).toHaveBeenCalled();
    });
  });

});
