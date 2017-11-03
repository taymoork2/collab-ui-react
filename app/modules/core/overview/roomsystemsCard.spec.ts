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

  describe('with csdm redux toggle', () => {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'csdmDevRedGetStatus').and.returnValue(this.$q.resolve(true));
      this.card = this.OverviewRoomSystemsCard.createCard();
      this.$rootScope.$apply();
    });
    it('should set the link to redux', function () {
      expect(this.card.settingsUrl).toBe('#/devices-redux');
    });
  });
  describe('without csdm redux toggle', () => {
    beforeEach(function () {
      spyOn(this.FeatureToggleService, 'csdmDevRedGetStatus').and.returnValue(this.$q.resolve());
      this.card = this.OverviewRoomSystemsCard.createCard();
      this.$rootScope.$apply();
    });
    it('should not set the link to redux', function () {
      expect(this.card.settingsUrl).toBe('#/devices');
    });
  });
});
