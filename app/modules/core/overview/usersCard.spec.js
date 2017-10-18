describe('OverviewUsersCard', function () {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$q',
      '$rootScope',
      'FeatureToggleService',
      'Orgservice',
      'OverviewUsersCard'
    );

    this.convertUserData = {
      success: true,
      totalResults: 10,
    };

    this.userData = {
      success: true,
      totalResults: 0,
    };

    this.licenses = [{
      licenses: [{
        licenseType: 'MESSAGING',
        usage: 2,
        volume: 10,
      }, {
        licenseType: 'STORAGE',
        usage: 2,
        volume: 10,
      }],
    }, {
      licenses: [{
        licenseType: 'COMMUNICATION',
        usage: 2,
        volume: 20,
      }, {
        licenseType: 'MESSAGING',
        usage: 2,
        volume: 10,
      }],
    }];
  });

  describe('primary behaviors:', function () {
    beforeEach(function () {
      spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.resolve(this.licenses));
      this.card = this.OverviewUsersCard.createCard();
      this.$rootScope.$apply();
    });

    it('should create user card', function () {
      expect(this.card.showLicenseCard).toBe(false);
      expect(this.card.name).toBe('overview.cards.users.title');
    });

    it('should stay on convert user card', function () {
      this.card.unlicensedUsersHandler(this.convertUserData);
      expect(this.card.usersToConvert).toBe(10);
      expect(this.card.showLicenseCard).toBe(false);
    });

    it('should create license card if convert users is 0', function () {
      this.card.unlicensedUsersHandler(this.userData);
      this.$rootScope.$apply();

      expect(this.card.usersToConvert).toBe(0);
      expect(this.card.showLicenseCard).toBe(true);
      expect(this.card.name).toBe('overview.cards.licenses.title');
      expect(this.card.licenseNumber).toBe(16);
      expect(this.card.licenseType).toBe(this.licenses[0].licenses[0].licenseType);
    });
  });

  describe('feature-toggle behaviors:', function () {
    describe('atlas-f3745-auto-assign-licenses:', function () {
      describe('enabled:', function () {
        it('should set "autoAssignLicensesStatus" property', function () {
          spyOn(this.FeatureToggleService, 'atlasF3745AutoAssignLicensesGetStatus').and.returnValue(this.$q.resolve(true));
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();

          expect(this.card.features.atlasF3745AutoAssignLicenses).toBe(true);
          expect(this.card.autoAssignLicensesStatus).toBeDefined();
        });
      });

      describe('disabled:', function () {
        it('should not set "autoAssignLicensesStatus" property', function () {
          spyOn(this.FeatureToggleService, 'atlasF3745AutoAssignLicensesGetStatus').and.returnValue(this.$q.resolve(false));
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();

          expect(this.card.features.atlasF3745AutoAssignLicenses).toBe(false);
          expect(this.card.autoAssignLicensesStatus).not.toBeDefined();
        });
      });
    });
  });
});
