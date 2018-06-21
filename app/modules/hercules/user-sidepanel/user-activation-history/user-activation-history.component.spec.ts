import userActivationHistory from './index';

describe('Component: userActivationHistory', () => {

  let mockJournalEntries = <any>[];
  let mockClusterList = <any>[];
  const mockResourceGroups = <any>[];
  const serviceId = '\'squared-fusion-cal\'';

  beforeEach(function () {
    this.initModules(userActivationHistory);
    this.injectDependencies('$q', '$stateParams', 'USSService', 'Authinfo', 'Notification', 'HybridServicesI18NService', 'HybridServicesClusterService', 'ResourceGroupService');
    this.$stateParams.currentUser = { id: 'balle' };
  });

  function initComponent() {
    spyOn(this.USSService, 'getUserActivationHistory').and.returnValue(this.$q.resolve(mockJournalEntries));
    spyOn(this.HybridServicesClusterService, 'getAll').and.returnValue(this.$q.resolve(mockClusterList));
    spyOn(this.HybridServicesI18NService, 'getLocalTimestamp').and.returnValue('');
    spyOn(this.ResourceGroupService, 'getAll').and.returnValue(this.$q.resolve(mockResourceGroups));
    this.compileComponent('userActivationHistory', {
      serviceId: serviceId,
    });
  }

  it('should init as expected', function() {
    initComponent.call(this);
    expect(this.controller.historyEntries).toBeDefined();
    expect(this.controller.historyEntries.length).toEqual(0);
  });

  it('should filter out history entries we do not know', function() {
    mockJournalEntries = [ { entry: { payload: { type: 'UnknownEvent' } } }, { entry: { payload: { type: 'AnotherUnknownEvent' } } } ];
    initComponent.call(this);
    expect(this.controller.historyEntries).toBeDefined();
    expect(this.controller.historyEntries.length).toEqual(0);
  });

  it('should set and decorate history entries', function() {
    mockClusterList = [{ id: '12345', name: 'Foo', connectors: [{ id: 'c_cal@ABCDEFG', hostname: 'Bar' }] }];
    mockJournalEntries = [
      {
        time: '2016-12-19T06:34:14.176Z',
        record: {
          payload: {
            type: 'UpdateUserStatus',
            orgId: 'fe5acf7a-6246-484f-8f43-3e8c910fc50d',
            userId: '983761d5-3120-4747-9ab3-a3960ecdecc8',
            service: 'squared-fusion-ec',
            state: 'activated',
          },
        },
      },
      {
        time: '2016-12-19T06:34:12.166Z',
        record: {
          payload: {
            type: 'SetAssignmentState',
            service: 'squared-fusion-cal',
            connectorId: 'c_cal@ABCDEFG',
            status: 'success',
          },
        },
      },
      {
        time: '2016-12-19T06:34:10.126Z',
        record: {
          payload: {
            type: 'AssignUser',
            service: 'squared-fusion-uc',
            assignments: [
              {
                clusterId: '12345',
                connectorId: 'c_cal@ABCDEFG',
                status: 'waiting',
              },
            ],
          },
        },
      },
    ];
    initComponent.call(this);
    expect(this.controller.historyEntries).toBeDefined();
    expect(this.controller.historyEntries.length).toEqual(3);

    // UpdateUserStatus event
    expect(this.controller.historyEntries[0].timestamp).toBeDefined();
    expect(this.controller.historyEntries[0].title).toBeDefined();
    expect(this.controller.historyEntries[0].status).toBeDefined();

    // SetAssignmentState event
    expect(this.controller.historyEntries[1].timestamp).toBeDefined();
    expect(this.controller.historyEntries[1].title).toBeDefined();
    expect(this.controller.historyEntries[1].connector).toBeDefined();
    expect(this.controller.historyEntries[1].connector.hostname).toEqual('Bar');

    // AssignUser event
    expect(this.controller.historyEntries[2].timestamp).toBeDefined();
    expect(this.controller.historyEntries[2].title).toBeDefined();
    expect(this.controller.historyEntries[2].assignments).toBeDefined();
    expect(this.controller.historyEntries[2].assignments.length).toEqual(1);
    expect(this.controller.historyEntries[2].assignedCluster).toBeDefined();
    expect(this.controller.historyEntries[2].assignedCluster.name).toEqual('Foo');
  });
});
