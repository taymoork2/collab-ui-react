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
      'OverviewHybridServicesCard',
      'ServiceDescriptorService'
    );

    this.jsonData = getJSONFixture('hercules/nothing-provisioned-cluster-list.json');
    this.clusterData = getJSONFixture('hercules/disco-systems-cluster-list.json');

    spyOn(this.HybridServicesClusterService, 'getAll');
    spyOn(this.Authinfo, 'isEntitled').and.returnValue(true);
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasHybridImpGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'atlasOffice365SupportGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.CloudConnectorService, 'getService').and.callFake(function (serviceId) {
      return {
        serviceId: (serviceId === 'squared-fusion-gcal') ? 'squared-fusion-gcal' : 'squared-fusion-cal',
        setup: false,
        cssClass: 'default',
      };
    });
    spyOn(this.ServiceDescriptorService, 'getServices');
  });

  it('should not show card when no services are set up', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData)));
    this.ServiceDescriptorService.getServices.and.returnValue(this.$q.resolve([{
      id: 'squared-fusion-cal',
      enabled: false,
    }, {
      id: 'squared-fusion-uc',
      enabled: false,
    }]));
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();

    expect(card.enabled).toBe(false);
  });

  it('should not show a service that is not set up', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData)));
    this.ServiceDescriptorService.getServices.and.returnValue(this.$q.resolve([{
      id: 'squared-fusion-cal',
      enabled: false,
    }, {
      id: 'squared-fusion-uc',
      enabled: false,
    }, {
      id: 'squared-fusion-media',
      enabled: false,
    }, {
      id: 'spark-hybrid-impinterop',
      enabled: false,
    }]));
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();

    expect(card.serviceList[0].setup).toBe(false);
    expect(card.serviceList[1].setup).toBe(false);
    expect(card.serviceList[2].setup).toBe(false);
    expect(card.serviceList[3].setup).toBe(false);
  });

  it('should show the card when services are set up', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.clusterData)));
    this.ServiceDescriptorService.getServices.and.returnValue(this.$q.resolve([{
      id: 'squared-fusion-cal',
      enabled: true,
    }, {
      id: 'squared-fusion-uc',
      enabled: false,
    }]));

    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();

    expect(card.enabled).toBe(true);
  });

  it('should not show Call if it is not set up, but still show Calendar', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.clusterData)));
    this.ServiceDescriptorService.getServices.and.returnValue(this.$q.resolve([{
      id: 'squared-fusion-cal',
      enabled: true,
    }, {
      id: 'squared-fusion-uc',
      enabled: false,
    }]));

    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();

    expect(card.serviceList[0].setup).toBe(false);
    expect(card.serviceList[1].setup).toBe(false);
    expect(card.serviceList[2].setup).toBe(true);
    expect(card.serviceList[3].setup).toBe(false);
  });

  it('should show card when google calendar is setup', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData)));
    this.CloudConnectorService.getService.and.callFake(function (serviceId) {
      if (serviceId === 'squared-fusion-gcal') {
        return { serviceId: 'squared-fusion-gcal', setup: true, cssClass: 'success' };
      } else {
        return { serviceId: 'squared-fusion-cal', setup: false, cssClass: 'default' };
      }
    });
    this.ServiceDescriptorService.getServices.and.returnValue(this.$q.resolve([]));
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();

    expect(card.enabled).toBe(true);
    expect(card.serviceList[0].setup).toBe(true);
  });

  it('should show the card even when the Google Calendar lookup fails, if at least one other service is set up in FMS', function () {
    this.HybridServicesClusterService.getAll.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData)));
    this.CloudConnectorService.getService.and.returnValue(this.$q.reject({}));
    this.ServiceDescriptorService.getServices.and.returnValue(this.$q.resolve([{
      id: 'squared-fusion-uc',
      enabled: true,
    }]));
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();
    expect(card.enabled).toBe(true);
  });

  // 2017 name update --> feature toggle removed
  it('notEnabledText should be "overview.cards.hybrid.notEnabledTextNew" by default', function () {
    var card = this.OverviewHybridServicesCard.createCard();
    this.$rootScope.$apply();
    expect(card.notEnabledText).toEqual('overview.cards.hybrid.notEnabledTextNew');
  });
});
