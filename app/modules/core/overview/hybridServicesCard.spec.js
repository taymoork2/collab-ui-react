describe('OverviewHybridServicesCard', function () {

  var OverviewHybridServicesCard, $rootScope, FusionClusterService, $q;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Core'));

  function dependencies(_OverviewHybridServicesCard_, _$rootScope_, _FusionClusterService_, _$q_) {
    OverviewHybridServicesCard = _OverviewHybridServicesCard_;
    $rootScope = _$rootScope_;
    FusionClusterService = _FusionClusterService_;
    $q = _$q_;
  }

  function initSpies() {
    spyOn(FusionClusterService, 'getAll');
  }

  beforeEach(inject(dependencies));
  beforeEach(inject(initSpies));

  it('should not show card when no services are set up', function () {
    var clustersWithNothingInstalled = getJSONFixture('hercules/nothing-provisioned-cluster-list.json');
    FusionClusterService.getAll.and.returnValue($q.resolve(clustersWithNothingInstalled));
    var card = OverviewHybridServicesCard.createCard();
    $rootScope.$apply();

    expect(card.enabled).toBe(false);
  });

  it('should not show a service that is not set up', function () {
    var clustersWithNoServices = getJSONFixture('hercules/nothing-provisioned-cluster-list.json');
    FusionClusterService.getAll.and.returnValue($q.resolve(clustersWithNoServices));
    var card = OverviewHybridServicesCard.createCard();
    $rootScope.$apply();

    expect(card.serviceList[0].setup).toBe(false);
    expect(card.serviceList[1].setup).toBe(false);
    expect(card.serviceList[2].setup).toBe(false);

  });

  it('should show the card when services are set up', function () {
    spyOn(FusionClusterService, 'getStatusForService');
    FusionClusterService.getStatusForService.and.returnValue({
      serviceId: '',
      setup: true,
      status: 'operational'
    });
    var clustersWithManyServices = getJSONFixture('hercules/disco-systems-cluster-list.json');
    FusionClusterService.getAll.and.returnValue($q.resolve(clustersWithManyServices));

    var card = OverviewHybridServicesCard.createCard();
    $rootScope.$apply();

    expect(card.enabled).toBe(true);
  });

  it('should not show Call if it is not set up, but still show Calendar', function () {
    spyOn(FusionClusterService, 'getStatusForService').and.callFake(function (serviceId) {
      return {
        serviceId: serviceId,
        setup: serviceId === 'squared-fusion-cal',
        status: 'operational'
      };
    });
    var clustersWithManyServices = getJSONFixture('hercules/disco-systems-cluster-list.json');
    FusionClusterService.getAll.and.returnValue($q.resolve(clustersWithManyServices));

    var card = OverviewHybridServicesCard.createCard();
    $rootScope.$apply();

    expect(card.serviceList[1].setup).toBe(true);
    expect(card.serviceList[2].setup).toBe(false);
  });

});
