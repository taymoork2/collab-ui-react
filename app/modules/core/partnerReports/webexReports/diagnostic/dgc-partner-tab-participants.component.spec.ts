import moduleName from './index';

describe('Component: DgcPartnerTabParticipants', () => {
  beforeAll(function() {
    this.conferenceID = 123;
    this.participants = [
      { nodeId: '123', joinTime: 1515132340000, leaveTime: 1515140412000, userName: 'Bing', duration: 8071, reason: 76, platform: 1, browser: 6, sessionType: 0 },
      { nodeId: '234', joinTime: 1515132418000, leaveTime: 1515132989000, userName: 'Liu', duration: 571, reason: 0, platform: 1, browser: 6, sessionType: 0 },
    ];
  });

  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$q', 'FeatureToggleService', 'Notification', 'PartnerSearchService', 'WebexReportsUtilService');
    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.WebexReportsUtilService, 'isPartnerReportPage').and.returnValue(true);
    spyOn(this.PartnerSearchService, 'getParticipants').and.returnValue(this.$q.resolve());
    spyOn(this.FeatureToggleService, 'diagnosticPartnerF8105ClientVersionGetStatus').and.returnValue(this.$q.resolve(true));
  }

  function initComponent(this) {
    this.compileComponent('dgcPartnerTabParticipants', { cid: this.conferenceID });
  }

  it('should not loading when call getParticipants', function () {
    this.PartnerSearchService.getParticipants.and.returnValue(this.$q.resolve(this.participants));
    initComponent.call(this);
    expect(this.controller.gridData).toHaveLength(2);
  });

  it('should call Notification.errorResponse when response status is 404', function () {
    this.PartnerSearchService.getParticipants.and.returnValue(this.$q.reject({ status: 404 }));
    initComponent.call(this);
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('should get correct data when call renderSharing', function () {
    const mockData = [{ key: '123', completed: true, items: [1, 2, 3] }];
    this.PartnerSearchService.getParticipants.and.returnValue(this.$q.resolve(this.participants));
    initComponent.call(this);

    this.controller.renderSharing(mockData);
    expect(this.controller.gridData[0].sharing).toBeDefined();
  });

  it('should get correct data when call getParticipantsActivity', function () {
    const mockData = [{ roleType: 'Host', toNodeId: '123' }];
    this.PartnerSearchService.getParticipants.and.returnValue(this.$q.resolve(this.participants));
    spyOn(this.PartnerSearchService, 'getRoleChange').and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this);
    this.controller.getParticipantsActivity();
    expect(this.controller.gridData[0].activity).toBeDefined();
  });
});
