'use strict';

fdescribe('ServiceStateChecker', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var ClusterService, NotificationService, ServiceStateChecker, DirSyncService, AuthInfo, USSService2;

  var notConfiguredClusterMockData = {
    id: 0,
    services: [{
      service_type: "c_cal",
      connectors: [{
        state: "not_configured"
      }, {
        state: "not_configured"
      }]
    }]
  };

  var okClusterMockData = {
    id: 0,
    services: [{
      service_type: "c_cal",
      connectors: [{
        state: "running"
      }, {
        state: "running"
      }]
    }]
  };

  var okUserStatusSummary = [{
    serviceId: 'squared-fusion-cal',
    activated: 10
  },
    {
      serviceId: 'squared-fusion-uc',
      activated: 10
    }
  ];

  beforeEach(module(function ($provide) {
    ClusterService = {
      getClusters: sinon.stub()
    };
    AuthInfo = {
      getOrgId: sinon.stub()
    };
    DirSyncService = {
      getDirSyncDomain: sinon.stub()
    };
    USSService2 = {
      getStatusesSummary: sinon.stub(),
      getOrg: sinon.stub()
    };
    AuthInfo.getOrgId.returns("orgId");
    $provide.value('ClusterService', ClusterService);
    $provide.value("Authinfo", AuthInfo);
    $provide.value("DirSyncService", DirSyncService);
    $provide.value("USSService2", USSService2);
  }));

  beforeEach(inject(function ($injector, _ServiceStateChecker_, _NotificationService_) {
    ServiceStateChecker = _ServiceStateChecker_;
    NotificationService = _NotificationService_;
  }));

  it("No clusters should raise the 'fuseNotPerformed' message", function () {
    ClusterService.getClusters.returns([]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('fuseNotPerformed');
  });

  it("No configured connectors should raise the 'fuseNotPerformed' message", function () {
    ClusterService.getClusters.returns([notConfiguredClusterMockData]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('configureConnectors');
  });

  it("Fusing a cluster should clear the 'fuseNotPerformed' message", function () {
    ClusterService.getClusters.returns([]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('fuseNotPerformed');
    ClusterService.getClusters.returns([notConfiguredClusterMockData]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('configureConnectors');
  });

  it("Dirsync not enabled should raise the 'dirSyncNotEnabled' message and clear appropriately", function () {
    USSService2.getStatusesSummary.returns(okUserStatusSummary);
    ClusterService.getClusters.returns([okClusterMockData]);
    DirSyncService.getDirSyncDomain.callsArgWith(0, {success: false, serviceMode: 'Argh!'});
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('dirSyncNotEnabled');
    DirSyncService.getDirSyncDomain.callsArgWith(0, {success: true, serviceMode: 'ENABLED'});
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it("No users activated should raise the 'noUsersActivated' message and clear appropriately", function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 0,
      error: 0,
      notActivated: 0
    }]);
    ClusterService.getClusters.returns([okClusterMockData]);
    DirSyncService.getDirSyncDomain.callsArgWith(0, {success: true, serviceMode: 'ENABLED'});
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-cal:noUsersActivated');
    USSService2.getStatusesSummary.returns([{serviceId: 'squared-fusion-cal', activated: 1}]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it("Users with errors should raise the 'userErrors' message and clear appropriately", function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 0,
      error: 5,
      notActivated: 0
    }]);
    ClusterService.getClusters.returns([okClusterMockData]);
    DirSyncService.getDirSyncDomain.callsArgWith(0, {success: true, serviceMode: 'ENABLED'});
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-cal:userErrors');
    USSService2.getStatusesSummary.returns([{serviceId: 'squared-fusion-cal', activated: 1}]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });
});
