import userStatusHistory from './index';

describe('Component: userStatusHistory', () => {

  let mockJournalEntries = <any>[];
  let mockClusterList = <any>[];
  let mockResourceGroups = <any>[];
  let serviceId = '\'squared-fusion-cal\'';

  beforeEach(function () {
    this.initModules(userStatusHistory);
    this.injectDependencies('$q', '$stateParams', 'USSService', 'Authinfo', 'Notification', 'FusionClusterService', 'ResourceGroupService');
    this.$stateParams.currentUser = { id: 'balle' };
  });

  function initComponent() {
    spyOn(this.USSService, 'getUserJournal').and.returnValue(this.$q.resolve(mockJournalEntries));
    spyOn(this.FusionClusterService, 'getAll').and.returnValue(this.$q.resolve(mockClusterList));
    spyOn(this.ResourceGroupService, 'getAll').and.returnValue(this.$q.resolve(mockResourceGroups));
    this.compileComponent('userStatusHistory', {
      serviceId: serviceId,
    });
  }

  it('should init as expected', function() {
    initComponent.call(this);
    expect(this.controller.historyEntries).toBeDefined();
    expect(this.controller.historyEntries.length).toEqual(0);
  });

  it('should filter out history entries we do not know', function() {
    mockJournalEntries = [ { entry: { type: 'UnknownEvent' } }, { entry: { type: 'AnotherUnknownEvent' } } ];
    initComponent.call(this);
    expect(this.controller.historyEntries).toBeDefined();
    expect(this.controller.historyEntries.length).toEqual(0);
  });

  it('should set and decorate history entries', function() {
    mockClusterList = [{ id: '12345', name: 'Foo', connectors: [{ id: 'c_cal@ABCDEFG', hostname: 'Bar' }] }];
    mockJournalEntries = [
      { time: '2016-12-19T06:34:14.176Z', entry: { type: 'SetUserStatus', payload: { state: 'error', clusterId: '12345', connectorId: 'c_cal@ABCDEFG', serviceId: 'squared-fusion-cal' } } },
      { time: '2016-12-19T06:30:12.186Z', entry: { type: 'AddEntitlement',  payload: { serviceId: 'squared-fusion-cal' } } },
    ];
    initComponent.call(this);
    expect(this.controller.historyEntries).toBeDefined();
    expect(this.controller.historyEntries.length).toEqual(2);

    // SetUserStatus event
    expect(this.controller.historyEntries[0].timestamp).toBeDefined();
    expect(this.controller.historyEntries[0].status).toBeDefined();
    expect(this.controller.historyEntries[0].homedConnector).toBeDefined();
    expect(this.controller.historyEntries[0].homedCluster).toBeDefined();
    expect(this.controller.historyEntries[0].homedCluster.name).toEqual('Foo');
    expect(this.controller.historyEntries[0].homedConnector.hostname).toEqual('Bar');

    // AddEntitlement event
    expect(this.controller.historyEntries[1].timestamp).toBeDefined();
    expect(this.controller.historyEntries[1].status).toBeUndefined();
  });
});
