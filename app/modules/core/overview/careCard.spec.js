/**
 * Created by sumshami on 29/08/16.
 */
describe('OverviewCareCard', function () {

  var OverviewCareCard, $rootScope;

  beforeEach(angular.mock.module('Core'));

  function dependencies(_OverviewCareCard_, _$rootScope_) {
    OverviewCareCard = _OverviewCareCard_;
    $rootScope = _$rootScope_;
  }

  beforeEach(inject(dependencies));

  it('should create disabled care card', function () {
    var card = OverviewCareCard.createCard();
    $rootScope.$apply();
    expect(card.enabled).toBe(false);
    expect(card.showHealth).toBe(false);
    expect(card.trial).toBe(false);
    expect(card.name).toEqual('overview.cards.care.title');
  });

});
