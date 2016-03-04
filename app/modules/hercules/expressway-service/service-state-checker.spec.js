'use strict';

describe('ServiceStateChecker', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $q, ClusterService, NotificationService, ServiceStateChecker, AuthInfo, USSService2, ScheduleUpgradeService;

  var notConfiguredClusterMockData = {
    id: 0,
    connectors: [{
      connectorType: 'c_mgmt',
      state: 'not_configured'
    }, {
      connectorType: 'c_cal',
      state: 'not_configured'
    }, {
      connectorType: 'c_cal',
      state: 'not_configured'
    }]
  };

  var okClusterMockData = {
    id: 0,
    connectors: [{
      connectorType: 'c_mgmt',
      state: 'running'
    }, {
      connectorType: 'c_cal',
      state: 'running'
    }, {
      connectorType: 'c_cal',
      state: 'running'
    }]
  };

  beforeEach(module(function ($provide) {
    ClusterService = {
      getClustersByConnectorType: sinon.stub(),
      getRunningStateSeverity: sinon.stub().returns({
        label: 'ok',
        value: 0
      })
    };
    AuthInfo = {
      getOrgId: sinon.stub()
    };
    USSService2 = {
      getStatusesSummary: sinon.stub(),
      getOrg: sinon.stub()
    };
    ScheduleUpgradeService = {
      get: sinon.stub()
    };
    AuthInfo.getOrgId.returns('orgId');
    $provide.value('ClusterService', ClusterService);
    $provide.value('Authinfo', AuthInfo);
    $provide.value('USSService2', USSService2);
    $provide.value('ScheduleUpgradeService', ScheduleUpgradeService);
  }));

  beforeEach(inject(function (_$q_, _ServiceStateChecker_, _NotificationService_) {
    $q = _$q_;
    ServiceStateChecker = _ServiceStateChecker_;
    NotificationService = _NotificationService_;
  }));

  it('should raise the "fuseNotPerformed" message if there are no connectors', function () {
    ClusterService.getClustersByConnectorType.returns([]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('fuseNotPerformed');
  });

  it('should raise the "fuseNotPerformed" message if all connectors are not configured ', function () {
    ClusterService.getClustersByConnectorType.returns([notConfiguredClusterMockData]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('configureConnectors');
  });

  it('should clear the "fuseNotPerformed" message when fusing a cluster ', function () {
    ClusterService.getClustersByConnectorType.returns([]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('fuseNotPerformed');
    ClusterService.getClustersByConnectorType.returns([notConfiguredClusterMockData]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('configureConnectors');
  });

  it('should raise the "noUsersActivated" message and clear appropriately when there are no users activated ', function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 0,
      error: 0,
      notActivated: 0
    }]);
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-cal:noUsersActivated');
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 1
    }]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should raise the "userErrors" message and clear appropriately when there are users with errors ', function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 0,
      error: 5,
      notActivated: 0
    }]);
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-cal:userErrors');
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 1
    }]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });
});
