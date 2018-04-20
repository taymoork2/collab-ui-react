describe('OverviewUsersCard', () => {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$q',
      '$rootScope',
      'FeatureToggleService',
      'OverviewHelper',
      'Authinfo',
      'OverviewRoomSystemsCard',
    );
  });

  describe('device link', () => {
    beforeEach(function () {
      this.card = this.OverviewRoomSystemsCard.createCard();
      this.$rootScope.$apply();
    });
    it('should also set the link to devices', function () {
      expect(this.card.settingsUrl).toBe('/devices');
    });
  });
});
