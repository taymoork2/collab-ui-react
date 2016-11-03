describe('Controller: HeaderCtrl', function () {
  var $scope, $controller;
  var controller, Utils, Authinfo;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  function dependencies($rootScope, _$controller_, _Utils_, _Authinfo_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    Utils = _Utils_;
    Authinfo = _Authinfo_;
  }

  function initSpies() {
    spyOn(Utils, 'isAdminPage');
  }

  function initController() {
    controller = $controller('HeaderCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  describe('is Admin Page', function () {
    beforeEach(setAdminPageSpy(true));
    beforeEach(initController);
    describe('and is customer admin', function () {
      beforeEach(function () {
        spyOn(Authinfo, 'isPartnerAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isPartnerSalesAdmin').and.returnValue(false);
      });
      it('should show my company page button', function () {
        expect(controller.showMyCompany()).toBe(true);
      });
      it('should hide company name', function () {
        expect(controller.showOrgName()).toBe(false);
      });
    });

    describe('and is partner admin', function () {
      beforeEach(function () {
        spyOn(Authinfo, 'isPartnerAdmin').and.returnValue(true);
        spyOn(Authinfo, 'isPartnerSalesAdmin').and.returnValue(false);
      });
      it('should hide my company page button', function () {
        expect(controller.showMyCompany()).toBe(false);
      });
      it('should show company name', function () {
        expect(controller.showOrgName()).toBe(true);
      });
    });

    describe('and is isPartnerSalesAdmin admin', function () {
      beforeEach(function () {
        spyOn(Authinfo, 'isPartnerAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isPartnerSalesAdmin').and.returnValue(true);
      });
      it('should hide my company page button', function () {
        expect(controller.showMyCompany()).toBe(false);
      });
      it('should show company name', function () {
        expect(controller.showOrgName()).toBe(true);
      });
    });

  });

  describe('Non-Admin Page', function () {
    beforeEach(setAdminPageSpy(false));
    beforeEach(initController);

    it('should not show my company page button', function () {
      expect(controller.showMyCompany()).toBe(false);
    });
  });

  function setAdminPageSpy(isAdminPage) {
    return function () {
      Utils.isAdminPage.and.returnValue(isAdminPage);
    };
  }
});
