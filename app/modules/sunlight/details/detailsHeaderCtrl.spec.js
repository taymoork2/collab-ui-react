describe('Care details ctrl', function () {
  var detailsCtrl;
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(function ($controller) {
    detailsCtrl = $controller('DetailsHeaderCtrl');
  }));

  it('should define header tabs', function () {
    expect(detailsCtrl.tabs.length).toEqual(1);
    expect(detailsCtrl.back).toBeFalsy();
    expect(detailsCtrl.tabs[0].title).toEqual('sunlightDetails.featuresTitle');
  });
});
