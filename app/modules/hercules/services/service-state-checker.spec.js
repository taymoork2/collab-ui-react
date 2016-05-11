'use strict';

describe('ServiceStateChecker', function () {
  beforeEach(module('Hercules'));
  beforeEach(module('Huron')); // Because FeatureToggle is used

  var $q, $rootScope, $httpBackend, ClusterService, NotificationService, ServiceStateChecker, AuthInfo, USSService2, ScheduleUpgradeService, ServiceDescriptor, DomainManagementService, FeatureToggleService, Orgservice;

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

    ServiceDescriptor = {
      services: sinon.stub(),
      isServiceEnabled: sinon.stub()
    };

    AuthInfo = {
      getOrgId: sinon.stub()
    };
    USSService2 = {
      getStatusesSummary: sinon.stub(),
      getOrg: sinon.stub(),
      getOrgId: sinon.stub()
    };

    Orgservice = {
      getOrg: sinon.stub()
    };

    ScheduleUpgradeService = {
      get: sinon.stub()
    };

    FeatureToggleService = {
      supports: sinon.stub(),
      features: {
        atlasSipUriDomainEnterprise: ''
      }
    };

    DomainManagementService = {
      domainList: sinon.stub(),
      getVerifiedDomains: sinon.stub()
    };

    AuthInfo.getOrgId.returns('orgId');
    $provide.value('ClusterService', ClusterService);
    $provide.value('Authinfo', AuthInfo);
    $provide.value('USSService2', USSService2);
    $provide.value('ScheduleUpgradeService', ScheduleUpgradeService);
    $provide.value('ServiceDescriptor', ServiceDescriptor);
    $provide.value('DomainManagementService', DomainManagementService);
    $provide.value('FeatureToggleService', FeatureToggleService);
    $provide.value('Orgservice', Orgservice);
  }));

  beforeEach(inject(function (_$q_, _$rootScope_, $injector, _ServiceStateChecker_, _NotificationService_) {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
    $q = _$q_;
    $rootScope = _$rootScope_;
    ServiceStateChecker = _ServiceStateChecker_;
    NotificationService = _NotificationService_;

    FeatureToggleService.supports.returns($q.resolve(false));

    DomainManagementService.getVerifiedDomains.returns($q.resolve());

    DomainManagementService.domainList = [{
      "domain": "somedomain"
    }];
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

  // Will happen if connector toggles back to "not_configured" state.
  it('should clear all user and service notifications when connector is not configured ', function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-uc',
      activated: 0,
      error: 0,
      notActivated: 0
    }]);

    // We have configured connectors, with both a user and service related notification
    ServiceDescriptor.isServiceEnabled = function (type, cb) {
      cb(null, true);
    };

    ServiceDescriptor.services = function (cb) {
      cb(null, [{
        id: 'squared-fusion-ec',
        enabled: false, // will spawn a 'connect available' notification,
        acknowledged: false
      }]);
    };

    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');

    expect(NotificationService.getNotificationLength()).toEqual(2); // one user and one service notification
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-uc:noUsersActivated');
    expect(NotificationService.getNotifications()[1].id).toEqual('callServiceConnectAvailable');

    // this should remove the user and service related notifications
    ClusterService.getClustersByConnectorType.returns([notConfiguredClusterMockData]);

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('configureConnectors');
  });

  it('should clear connect available notification when connect is configured ', function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-uc',
      activated: 1,
      error: 0,
      notActivated: 0
    }]);

    USSService2.getOrgId.returns('orgId');
    USSService2.getOrg.returns($q.when({}));

    ServiceDescriptor.isServiceEnabled = function (type, cb) {
      cb(null, true);
    };

    ServiceDescriptor.services = function (cb) {
      cb(null, [{
        id: 'squared-fusion-ec',
        enabled: false, // will spawn a 'connect available' notification,
        acknowledged: false
      }]);
    };

    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');

    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('callServiceConnectAvailable');

    // this should remove the connect notifications
    ServiceDescriptor.services = function (cb) {
      cb(null, [{
        id: 'squared-fusion-ec',
        enabled: true,
        acknowledged: false
      }]);
    };

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');

    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should add a notification when no domains are added ', function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-uc',
      activated: 1,
      error: 0,
      notActivated: 0
    }]);

    USSService2.getOrgId.returns('orgId');
    USSService2.getOrg.returns($q.when({}));

    ServiceDescriptor.isServiceEnabled = function (type, cb) {
      cb(null, true);
    };

    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));
    // this should spawn a domain verification notification
    DomainManagementService.domainList = [];

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');
    $rootScope.$digest();

    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('noDomains');
  });

  it('should clear the domain verification notification when one domain is added ', function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-uc',
      activated: 1,
      error: 0,
      notActivated: 0
    }]);

    USSService2.getOrgId.returns('orgId');
    USSService2.getOrg.returns($q.when({}));

    ServiceDescriptor.isServiceEnabled = function (type, cb) {
      cb(null, true);
    };

    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));
    // this should spawn a dom verification notification
    DomainManagementService.domainList = [];

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');
    $rootScope.$digest();
    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('noDomains');

    DomainManagementService.domainList = [{
      "domain": "some domain"
    }];

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should add sip uri domain notification when sip uri domain is not set ', function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-uc',
      activated: 1,
      error: 0,
      notActivated: 0
    }]);
    USSService2.getOrgId.returns('orgId');
    USSService2.getOrg.returns($q.when({
      'sipDomain': 'somedomain'
    }));
    ServiceDescriptor.isServiceEnabled = function (type, cb) {
      cb(null, true);
    };
    ServiceDescriptor.services = function (cb) {
      cb(null, [{
        id: 'squared-fusion-ec',
        enabled: true,
        acknowledged: false
      }]);
    };
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));
    FeatureToggleService.supports.returns($q.resolve(true));
    Orgservice.getOrg = function (cb) {
      cb({}, 200);
    };

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');
    $rootScope.$digest();

    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('sipUriDomainEnterpriseNotConfigured');
  });

  it('should remove sip uri domain notification when sip uri domain is set', function () {
    USSService2.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-uc',
      activated: 1,
      error: 0,
      notActivated: 0
    }]);
    USSService2.getOrgId.returns('orgId');
    USSService2.getOrg.returns($q.when({
      'sipDomain': 'somedomain'
    }));
    ServiceDescriptor.isServiceEnabled = function (type, cb) {
      cb(null, true);
    };
    ServiceDescriptor.services = function (cb) {
      cb(null, [{
        id: 'squared-fusion-ec',
        enabled: true,
        acknowledged: false
      }]);
    };
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ScheduleUpgradeService.get.returns($q.when({
      isAdminAcknowledged: true
    }));
    FeatureToggleService.supports.returns($q.resolve(true));
    Orgservice.getOrg = function (cb) {
      cb({}, 200);
    };

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');
    $rootScope.$digest();

    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('sipUriDomainEnterpriseNotConfigured');

    // now we set the value in CI
    Orgservice.getOrg = function (cb) {
      cb({
        'orgSettings': {
          'sipCloudDomain': 'sipCloudDomain'
        }
      }, 200);

      ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');
      $rootScope.$digest();

      expect(NotificationService.getNotificationLength()).toEqual(0);
    };
  });
});
