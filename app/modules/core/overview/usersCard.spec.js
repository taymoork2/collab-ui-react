describe('OverviewUsersCard', function () {

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$rootScope', '$q', 'OverviewUsersCard', 'Orgservice');

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

    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.when(this.licenses));

    this.card = this.OverviewUsersCard.createCard();
    this.$rootScope.$apply();
  });

  it('should create user card', function () {
    expect(this.card.showLicenseCard).toEqual(false);
    expect(this.card.name).toEqual('overview.cards.users.title');
  });

  it('should stay on convert user card', function () {
    this.card.unlicensedUsersHandler(this.convertUserData);
    expect(this.card.usersToConvert).toEqual(10);
    expect(this.card.showLicenseCard).toEqual(false);
  });

  it('should create license card if convert users is 0', function () {
    this.card.unlicensedUsersHandler(this.userData);
    this.$rootScope.$apply();

    expect(this.card.usersToConvert).toEqual(0);
    expect(this.card.showLicenseCard).toEqual(true);
    expect(this.card.name).toEqual('overview.cards.licenses.title');
    expect(this.card.licenseNumber).toEqual(16);
    expect(this.card.licenseType).toEqual(this.licenses[0].licenses[0].licenseType);
  });
});
