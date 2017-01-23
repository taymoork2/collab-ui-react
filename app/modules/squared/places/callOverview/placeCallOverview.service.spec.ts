describe('Service: PlaceCallOverviewService', () => {
    let customer, languages, sites, siteLanguage;
    let $q, $scope, PlaceCallOverviewService, ServiceSetup, PlacesService;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Squared'));
    beforeEach(inject((_$q_,
                        _PlaceCallOverviewService_,
                        _ServiceSetup_,
                        _PlacesService_,
                        $rootScope) => {
    $q = _$q_;
    PlaceCallOverviewService = _PlaceCallOverviewService_;
    ServiceSetup = _ServiceSetup_;
    PlacesService = _PlacesService_;
    $scope = $rootScope.$new();
    customer = getJSONFixture('huron/json/settings/customer.json');
    languages = getJSONFixture('huron/json/settings/languages.json');
    sites = getJSONFixture('huron/json/settings/sites.json');
    siteLanguage = 'en_US';
    }));
  //beforeEach(function () {
    /*this.initModules('squared.places.call-overview');
    this.injectDependencies(
      'PlaceCallOverviewService',
      'ServiceSetup',
      'PlacesService',
      'Authinfo',
      '$rootScope',
      '$scope',
      '$q'
    );*/
    //this.getSiteLanguagesDefer = this.$q.defer();
    //spyOn(this.ServiceSetup, 'getSiteLanguages').and.returnValue(this.getSiteLanguagesDefer.promise);
    //this.getOrgIdDefer = this.$q.defer();
    //spyOn(this.Authinfo, 'getOrgId').and.returnValue(this.getOrgIdDefer.promise);
 // });
    describe('get requests - ', () => {
        beforeEach(function () {
            spyOn(ServiceSetup, 'listSites').and.callFake(function () {
                ServiceSetup.sites = sites;
                return this.$q.when();
            });
            //this.getSiteLanguagesDefer.resolve(this.languages);
            //this.getOrgIdDefer.resolve(this.customer.uuid);
        });
        it('should return site level preferred language', function () {
            PlaceCallOverviewService.getSiteLevelLanguage().then(function (result) {
            expect(angular.equals(result, siteLanguage)).toBe(true);
            });
            this.$rootScope.$digest();
        });
    });
});
