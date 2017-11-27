describe('Care details ctrl', () => {
  beforeEach(function () {
    angular.mock.module('Sunlight');
    this.injectDependencies('$controller');
    this.controller = this.$controller('DetailsHeaderCtrl');
  });

  it('should define header tabs', function () {
    expect(this.controller.tabs.length).toEqual(2);
    expect(this.controller.back).toBeFalsy();
    expect(this.controller.tabs[0].title).toEqual('sunlightDetails.featuresTitle');
    expect(this.controller.tabs[1].title).toEqual('sunlightDetails.settingsTitle');
  });
});
