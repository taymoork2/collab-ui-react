describe('Component: userStatusHistory', () => {

  let mockJournalEntries = <any>[];
  let mockConnector = <any>{};
  let mockResourceGroups = <any>[];

  beforeEach(function () {
    this.initModules('Hercules');
    this.injectDependencies('$q', '$state', '$stateParams', 'USSService', 'Authinfo', 'Notification', 'ClusterService', 'ResourceGroupService');
    this.$state.params = { serviceId: 'squared-fusion-cal' };
    this.$stateParams.currentUser = { id: 'balle' };
  });

  function initComponent() {
    spyOn(this.USSService, 'getUserJournal').and.returnValue(this.$q.resolve(mockJournalEntries));
    spyOn(this.ClusterService, 'getConnector').and.returnValue(this.$q.resolve(mockConnector));
    spyOn(this.ResourceGroupService, 'getAll').and.returnValue(this.$q.resolve(mockResourceGroups));
    this.compileComponent('userStatusHistory', {
      USSService: this.USSService,
      $state: this.$state,
      $stateParams: this.$stateParams,
      Authinfo: this.Authinfo,
      Notification: this.Notification,
      ClusterService: this.ClusterService,
      ResourceGroupService: this.ResourceGroupService,
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
});
