describe('OverviewUsersCard', function () {

  var $rootScope, OverviewUsersCard, card;

  var convertUserData = {
    success: true,
    totalResults: 10
  };

  var userData = {
    success: true,
    totalResults: 0
  };

  afterEach(function () {
    $rootScope = OverviewUsersCard = card = undefined;
  });

  afterAll(function () {
    convertUserData = userData = undefined;
  });

  beforeEach(angular.mock.module('Core'));

  function dependencies(_OverviewUsersCard_, _$rootScope_) {
    $rootScope = _$rootScope_;
    OverviewUsersCard = _OverviewUsersCard_;
  }

  beforeEach(inject(dependencies));

  describe('overviewuserscard', function () {
    beforeEach(function () {
      card = OverviewUsersCard.createCard();
      $rootScope.$apply();
    });

    it('should create user card', function () {
      expect(card.showLicenseCard).toEqual(false);
      expect(card.name).toEqual('overview.cards.users.title');
    });

    it('should stay on convert user card', function () {
      card.unlicensedUsersHandler(convertUserData);
      expect(card.usersToConvert).toEqual(10);
      expect(card.showLicenseCard).toEqual(false);
    });

    it('should create license card if convert users is 0', function () {
      card.unlicensedUsersHandler(userData);
      expect(card.usersToConvert).toEqual(0);
      expect(card.showLicenseCard).toEqual(true);
      expect(card.name).toEqual('overview.cards.licenses.title');
    });
  });
});
