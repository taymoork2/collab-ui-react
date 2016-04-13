/**
 * Created by sjalipar on 4/13/16.
 */
describe('Care details ctrl', function () {
  var detailsCtrl;
  beforeEach(module('Sunlight'));
  beforeEach(inject(function ($controller) {
    detailsCtrl = $controller('DetailsHeaderCtrl', function () {});
  }));

  it('should define header title and tabs', function () {
    expect(detailsCtrl.title).toEqual('sunlightDetails.title');
    expect(detailsCtrl.tabs.length).toEqual(2);
    expect(detailsCtrl.back).toBeFalsy();
    expect(detailsCtrl.tabs[0].title).toEqual('sunlightDetails.featuresTitle');
    expect(detailsCtrl.tabs[1].title).toEqual('sunlightDetails.settingsTitle');
  });
});
