describe('Controller: HeaderCtrl', function () {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$controller',
      '$q',
      '$scope',
      'Authinfo',
      'ProPackService',
      'Utils',
      'ControlHubService'
    );

    spyOn(this.ControlHubService, 'getControlHubEnabled').and.returnValue(this.$q.resolve(false));
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));

    this.initController = function () {
      this.controller = this.$controller('HeaderCtrl', {
        $scope: this.$scope,
      });
      this.$scope.$apply();
    };
  });

  describe('is Admin Page', function () {
    beforeEach(function () {
      spyOn(this.Utils, 'isAdminPage').and.returnValue(true);
      this.initController();
    });

    describe('and is customer admin', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isCustomerAdmin').and.returnValue(true);
        spyOn(this.Authinfo, 'isCustomerView').and.returnValue(true);
      });

      it('should show my company page button', function () {
        expect(this.controller.showMyCompany()).toBe(true);
      });

      it('should hide company name', function () {
        expect(this.controller.showOrgName()).toBe(false);
      });
    });

    describe('and is partner admin', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isPartnerAdmin').and.returnValue(true);
        spyOn(this.Authinfo, 'isPartnerSalesAdmin').and.returnValue(false);
      });

      it('should hide my company page button', function () {
        expect(this.controller.showMyCompany()).toBe(false);
      });

      it('should show company name', function () {
        expect(this.controller.showOrgName()).toBe(true);
      });
    });

    describe('and is isPartnerSalesAdmin admin', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isPartnerAdmin').and.returnValue(false);
        spyOn(this.Authinfo, 'isPartnerSalesAdmin').and.returnValue(true);
      });

      it('should hide my company page button', function () {
        expect(this.controller.showMyCompany()).toBe(false);
      });

      it('should show company name', function () {
        expect(this.controller.showOrgName()).toBe(true);
      });
    });
  });

  describe('Readonly Admin Page', function () {
    it('should show my company page button', function () {
      spyOn(this.Utils, 'isAdminPage').and.returnValue(true);
      spyOn(this.Authinfo, 'isReadOnlyAdmin').and.returnValue(true);
      spyOn(this.Authinfo, 'isCustomerView').and.returnValue(true);
      this.initController();
      expect(this.controller.showMyCompany()).toBe(true);
    });
  });

  describe('Non-Admin Page', function () {
    it('should not show my company page button', function () {
      spyOn(this.Utils, 'isAdminPage').and.returnValue(false);
      this.initController();
      expect(this.controller.showMyCompany()).toBe(false);
    });
  });

  describe('2017 name update', function () {
    it('should default headerTitle to loginPage.title', function () {
      this.initController();
      expect(this.controller.headerTitle).toEqual('loginPage.title');
    });

    it('should set headerTitle to loginPage.titleNew when getControlHubEnabled is true', function () {
      this.ControlHubService.getControlHubEnabled.and.returnValue(this.$q.resolve(true));
      this.initController();
      expect(this.controller.headerTitle).toEqual('loginPage.titleNew');
    });

    it('should set headerTitle to loginPage.titlePro when getControlHubEnabled and hasProPackPurchased is true', function () {
      this.ControlHubService.getControlHubEnabled.and.returnValue(this.$q.resolve(true));
      this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(true));
      this.initController();
      expect(this.controller.headerTitle).toEqual('loginPage.titlePro');
    });
  });
});
