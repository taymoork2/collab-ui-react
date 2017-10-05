describe('OverviewHybridServicesCard', function () {
  beforeEach(function () {
    this.initModules('Core', 'Hercules');
    this.injectDependencies(
      '$controller',
      '$q',
      '$rootScope',
      'Authinfo',
      'FeatureToggleService',
      'CloudConnectorService',
      'HybridServicesClusterService',
      'OverviewHybridServicesCard'
    );

    this.jsonData = getJSONFixture('hercules/nothing-provisioned-cluster-list.json');
    this.clusterData = getJSONFixture('hercules/disco-systems-cluster-list.json');

    spyOn(this.HybridServicesClusterService, 'getAll');
    spyOn(this.Authinfo, 'isEntitled').and.returnValue(true);
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'atlasHybridImpGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.CloudConnectorService, 'getService').and.returnValue(this.$q.resolve({ serviceId: 'squared-fusion-gcal', setup: false, cssClass: 'default' }));
  });

  it('should not show card when no services are set up', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData)));
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();

    expect(card.enabled).toBe(false);
  });

  it('should not show a service that is not set up', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData)));
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();

    expect(card.serviceList[0].setup).toBe(false);
    expect(card.serviceList[1].setup).toBe(false);
    expect(card.serviceList[2].setup).toBe(false);
    expect(card.serviceList[3].setup).toBe(false);
  });

  it('should show the card when services are set up', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.clusterData)));
    spyOn(this.HybridServicesClusterService, 'getStatusForService').and.returnValue({
      serviceId: '',
      setup: true,
      status: 'operational',
    });

    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();

    expect(card.enabled).toBe(true);
  });

  it('should not show Call if it is not set up, but still show Calendar', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.clusterData)));
    spyOn(this.HybridServicesClusterService, 'getStatusForService').and.callFake(function (serviceId) {
      return {
        serviceId: serviceId,
        setup: serviceId === 'squared-fusion-cal',
        status: 'operational',
      };
    });

    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();

    expect(card.serviceList[0].setup).toBe(false);
    expect(card.serviceList[1].setup).toBe(true);
    expect(card.serviceList[2].setup).toBe(false);
  });

  it('should show card when google calendar is setup', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData)));
    this.CloudConnectorService.getService.and.returnValue(this.$q.resolve({ serviceId: 'squared-fusion-gcal', setup: true, cssClass: 'success' }));
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();

    expect(card.enabled).toBe(true);
    expect(card.serviceList[0].setup).toBe(true);
  });

  it('should show the card even when the Google Calendar lookup fails, if at least one other service is set up in FMS', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData)));
    this.CloudConnectorService.getService.and.returnValue(this.$q.reject({}));
    spyOn(this.HybridServicesClusterService, 'getStatusForService').and.returnValue({
      setup: true,
    });
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();
    expect(card.enabled).toBe(true);
  });

  // 2017 name update
  it('notEnabledText should be "overview.cards.hybrid.notEnabledText" when atlas2017NameChangeGetStatus is false', function () {
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();
    expect(card.notEnabledText).toEqual('overview.cards.hybrid.notEnabledText');
  });

  it('notEnabledText should be "overview.cards.hybrid.notEnabledTextNew" when atlas2017NameChangeGetStatus is true', function () {
    this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();
    expect(card.notEnabledText).toEqual('overview.cards.hybrid.notEnabledTextNew');
  });
});
