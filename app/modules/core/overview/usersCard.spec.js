describe('OverviewUsersCard', function () {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$q',
      '$rootScope',
      'Authinfo',
      'AutoAssignTemplateService',
      'DirSyncService',
      'FeatureToggleService',
      'MultiDirSyncService',
      'Orgservice',
      'OverviewUsersCard',
      'UserListService'
    );
    spyOn(this.FeatureToggleService, 'atlasF6980MultiDirSyncGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'atlasF3745AutoAssignLicensesGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'atlasF7208GDPRConvertUserGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'autoLicenseGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.DirSyncService, 'requiresRefresh').and.returnValue(false);
    spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(false);

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
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.resolve(this.licenses));

    this.listUsersData = {
      status: 200,
      data: {
        totalResults: 10,
      },
    };
    spyOn(this.UserListService, 'listUsersAsPromise').and.returnValue(this.$q.resolve(this.listUsersData));
  });

  describe('primary behaviors:', function () {
    beforeEach(function () {
      this.card = this.OverviewUsersCard.createCard();
      this.$rootScope.$apply();
    });

    it('should create user card', function () {
      expect(this.card.showLicenseCard).toBe(false);
      expect(this.card.name).toBe('overview.cards.users.title');
    });

    it('should stay on convert user card', function () {
      this.card.orgEventHandler(this.convertUserData);
      this.card.unlicensedUsersHandler(this.convertUserData);
      this.$rootScope.$apply();

      expect(this.card.usersToConvert).toBe(10);
      expect(this.card.showLicenseCard).toBe(false);
    });

    it('should create license card if convert users is 0', function () {
      this.card.orgEventHandler(this.userData);
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
      beforeEach(function () {
        spyOn(this.AutoAssignTemplateService, 'hasDefaultTemplate').and.returnValue(this.$q.resolve(true));
        spyOn(this.AutoAssignTemplateService, 'isEnabledForOrg').and.returnValue(this.$q.resolve(true));
      });
      describe('enabled:', function () {
        it('should set "autoAssignLicensesStatus" property', function () {
          this.FeatureToggleService.atlasF3745AutoAssignLicensesGetStatus.and.returnValue(this.$q.resolve(true));
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();

          expect(this.card.features.atlasF3745AutoAssignLicenses).toBe(true);
          expect(this.card.hasAutoAssignDefaultTemplate).toBe(true);
          expect(this.card.isAutoAssignTemplateActive).toBe(true);
          expect(this.card.getAutoAssignLicensesStatusCssClass()).toBe('success');

          this.AutoAssignTemplateService.isEnabledForOrg.and.returnValue(this.$q.resolve(false));
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();

          expect(this.card.features.atlasF3745AutoAssignLicenses).toBe(true);
          expect(this.card.hasAutoAssignDefaultTemplate).toBe(true);
          expect(this.card.isAutoAssignTemplateActive).toBe(false);
          expect(this.card.getAutoAssignLicensesStatusCssClass()).toBe('disabled');

          this.AutoAssignTemplateService.hasDefaultTemplate.and.returnValue(this.$q.resolve(false));
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();

          expect(this.card.features.atlasF3745AutoAssignLicenses).toBe(true);
          expect(this.card.hasAutoAssignDefaultTemplate).toBe(false);
          expect(this.card.isAutoAssignTemplateActive).toBe(false);
          expect(this.card.getAutoAssignLicensesStatusCssClass()).toBe('disabled');
        });

        it('should update "usersOnboarded" if call to "UserListService.listUsersAsPromise()" resolves with data', function () {
          this.FeatureToggleService.atlasF3745AutoAssignLicensesGetStatus.and.returnValue(this.$q.resolve(true));
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();

          expect(this.UserListService.listUsersAsPromise).toHaveBeenCalled();
          expect(this.card.usersOnboarded).toBe(10);
        });

        it('should set "usersOnboarded" appropriately if call to "UserListService.listUsersAsPromise()" rejects', function () {
          this.listUsersData403 = {
            status: 403,
            data: {
              Errors: [{
                errorCode: '200045',
              }],
            },
          };

          this.listUsersData503 = {
            status: 503,
            data: {
              Errors: [{
                errorCode: '400143',
              }],
            },
          };
          this.FeatureToggleService.atlasF3745AutoAssignLicensesGetStatus.and.returnValue(this.$q.resolve(true));
          this.UserListService.listUsersAsPromise.and.returnValue(this.$q.reject(this.listUsersData403));
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();

          expect(this.card.usersOnboarded).toBe('3000+');

          this.UserListService.listUsersAsPromise.and.returnValue(this.$q.reject(this.listUsersData503));
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();

          expect(this.card.isOnboardingError).toBe(true);
          expect(this.card.usersOnboardedError).toBe('overview.cards.users.onboardError');
        });
      });

      describe('disabled:', function () {
        it('should not set "autoAssignLicensesStatus" property', function () {
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();

          expect(this.AutoAssignTemplateService.hasDefaultTemplate).not.toHaveBeenCalled();
          expect(this.AutoAssignTemplateService.isEnabledForOrg).not.toHaveBeenCalled();
          expect(this.card.features.atlasF3745AutoAssignLicenses).toBe(false);
          expect(this.card.hasAutoAssignDefaultTemplate).toBe(false);
          expect(this.card.isAutoAssignTemplateActive).toBe(false);
          expect(this.card.getAutoAssignLicensesStatusCssClass()).toBe('disabled');
        });
      });
    });

    describe('atlasF6980MultiDirSyncGetStatus', function () {
      it('should hit DirSyncService when the toggle returns false', function () {
        this.card = this.OverviewUsersCard.createCard();
        this.$rootScope.$apply();
        this.card.orgEventHandler({ success: true });
        this.$rootScope.$apply();

        expect(this.DirSyncService.requiresRefresh).toHaveBeenCalledTimes(1);
        expect(this.DirSyncService.isDirSyncEnabled).toHaveBeenCalledTimes(1);
        expect(this.card.dirsyncEnabled).toBe(false);
        expect(this.card.isUpdating).toBe(false);
      });

      describe('when the toggle is true', function () {
        beforeEach(function () {
          this.FeatureToggleService.atlasF6980MultiDirSyncGetStatus.and.returnValue(this.$q.resolve(true));
        });

        it('should hit MultiDirSyncService and display true when there are domains when the toggle returns true', function () {
          spyOn(this.MultiDirSyncService, 'isDirsyncEnabled').and.returnValue(this.$q.resolve(true));
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();
          this.card.orgEventHandler({ success: true });
          this.$rootScope.$apply();

          expect(this.MultiDirSyncService.isDirsyncEnabled).toHaveBeenCalledTimes(1);
          expect(this.card.dirsyncEnabled).toBe(true);
          expect(this.card.isUpdating).toBe(false);
        });

        it('should hit MultiDirSyncService and display false when there are no domains when the toggle returns true', function () {
          spyOn(this.MultiDirSyncService, 'isDirsyncEnabled').and.returnValue(this.$q.resolve(false));
          this.card = this.OverviewUsersCard.createCard();
          this.$rootScope.$apply();
          this.card.orgEventHandler({ success: true });
          this.$rootScope.$apply();

          expect(this.MultiDirSyncService.isDirsyncEnabled).toHaveBeenCalledTimes(1);
          expect(this.card.dirsyncEnabled).toBe(false);
          expect(this.card.isUpdating).toBe(false);
        });
      });
    });

    describe('atlasF7208GDPRConvertUser', function () {
      beforeEach(function () {
        this.mock = _.cloneDeep(getJSONFixture('core/json/organizations/unlicensedUsers.json'));
      });

      describe('enabled:', function () {
        beforeEach(function () {
          this.FeatureToggleService.atlasF7208GDPRConvertUserGetStatus.and.returnValue(this.$q.resolve(true));
          this.card = this.OverviewUsersCard.createCard();
          this.card.orgEventHandler(this.mock);
          this.card.unlicensedUsersHandler(this.mock);
          this.$rootScope.$apply();
        });
        it('should set potential and pending conversions properties', function () {
          expect(this.card.features.atlasF7208GDPRConvertUser).toBe(true);
          expect(this.card.potentialConversions).toBe(0);
          expect(this.card.pendingConversions).toBe(0);
        });
      });
      describe('disabled:', function () {
        beforeEach(function () {
          this.card = this.OverviewUsersCard.createCard();
          this.card.orgEventHandler(this.mock);
          this.card.unlicensedUsersHandler(this.mock);
          this.$rootScope.$apply();
        });
        it('should not set pontential and pending conversions properties', function () {
          expect(this.card.features.atlasF7208GDPRConvertUser).toBe(false);
          expect(this.card.potentialConversions).toBeUndefined();
          expect(this.card.pendingConversions).toBeUndefined();
        });
      });
    });
  });
});
