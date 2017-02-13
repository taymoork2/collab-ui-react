'use strict';

describe('Service: ServiceStateChecker', function () {
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(angular.mock.module('Hercules'));

  var $q, $rootScope, $httpBackend, ClusterService, NotificationService, ServiceStateChecker, USSService, ServiceDescriptor, DomainManagementService, FeatureToggleService, Orgservice, FusionClusterService;

  var okClusterMockData = {
    id: 0,
    name: 'Tom is Awesome!',
    releaseChannel: 'stable',
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

  function mockDependencies($provide) {
    $provide.value('CsdmPoller', {
      create: sinon.stub().returns({
        forceAction: sinon.stub()
      })
    });
    $provide.value('Authinfo', {
      getOrgId: sinon.stub().returns('orgId')
    });
  }

  beforeEach(inject(function (_$q_, _$httpBackend_, _$rootScope_, _NotificationService_, _ClusterService_, _FeatureToggleService_, _FusionClusterService_, _ServiceStateChecker_, _DomainManagementService_, _Orgservice_, _ServiceDescriptor_, _USSService_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    NotificationService = _NotificationService_;
    FeatureToggleService = _FeatureToggleService_;
    FusionClusterService = _FusionClusterService_;
    ServiceStateChecker = _ServiceStateChecker_;
    DomainManagementService = _DomainManagementService_;
    Orgservice = _Orgservice_;
    ServiceDescriptor = _ServiceDescriptor_;
    USSService = _USSService_;
    ClusterService = _ClusterService_;

    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
    ClusterService.getClustersByConnectorType = sinon.stub().returns([]);
    ClusterService.subscribe = sinon.stub();
    DomainManagementService.getVerifiedDomains = sinon.stub().returns($q.resolve([{
      domain: 'somedomain'
    }]));
    FeatureToggleService.supports = sinon.stub().returns($q.resolve(false));
    FusionClusterService.getOrgSettings = sinon.stub().returns($q.resolve({ expresswayClusterReleaseChannel: 'stable' }));
    Orgservice.getOrg = sinon.stub();
    ServiceDescriptor.isServiceEnabled = sinon.stub();
    ServiceDescriptor.services = sinon.stub();
    USSService.getOrg = sinon.stub();
    USSService.getOrgId = sinon.stub();
    USSService.getStatusesSummary = sinon.stub();
    FusionClusterService.getAlarms = sinon.stub().returns($q.resolve([]));
  }));

  it('should raise the "fuseNotPerformed" message if there are no connectors', function () {
    ClusterService.getClustersByConnectorType.returns([]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('fuseNotPerformed');
  });

  it('should clear the "fuseNotPerformed" message when fusing a cluster ', function () {
    ClusterService.getClustersByConnectorType.returns([]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('fuseNotPerformed');
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should raise the "noUsersActivated" message and clear appropriately when there are no users activated ', function () {
    USSService.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 0,
      error: 0,
      notActivated: 0
    }]);
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-cal:noUsersActivated');
    USSService.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 1
    }]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should raise the "userErrors" message and clear appropriately when there are users with errors ', function () {
    USSService.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 0,
      error: 5,
      notActivated: 0
    }]);
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-cal:userErrors');
    USSService.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-cal',
      activated: 1
    }]);
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should clear connect available notification when connect is configured ', function () {
    USSService.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-uc',
      activated: 1,
      error: 0,
      notActivated: 0
    }]);

    USSService.getOrgId.returns('orgId');
    USSService.getOrg.returns($q.resolve({}));

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

  it('should add and correctly clear the domain verification', function () {
    USSService.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-uc',
      activated: 1,
      error: 0,
      notActivated: 0
    }]);

    USSService.getOrgId.returns('orgId');
    USSService.getOrg.returns($q.resolve({}));

    ServiceDescriptor.isServiceEnabled = function (type, cb) {
      cb(null, true);
    };

    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);

    // this should spawn a domain verification notification
    DomainManagementService.getVerifiedDomains = sinon.stub().returns($q.resolve([]));

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('noDomains');

    // Domain added, should clear the notification
    DomainManagementService.getVerifiedDomains = sinon.stub().returns($q.resolve([{
      domain: 'somedomain'
    }]));

    ServiceStateChecker.checkState('c_mgmt', 'squared-fusion-uc');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should add sip uri domain notification when sip uri domain is not set ', function () {
    FusionClusterService.getOrgSettings.returns($q.resolve({ expresswayClusterReleaseChannel: 'stable' }));
    USSService.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-uc',
      activated: 1,
      error: 0,
      notActivated: 0
    }]);
    USSService.getOrgId.returns('orgId');
    USSService.getOrg.returns($q.resolve({
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
    FusionClusterService.getOrgSettings.returns($q.resolve({ expresswayClusterReleaseChannel: 'stable' }));
    USSService.getStatusesSummary.returns([{
      serviceId: 'squared-fusion-uc',
      activated: 1,
      error: 0,
      notActivated: 0
    }]);
    USSService.getOrgId.returns('orgId');
    USSService.getOrg.returns($q.resolve({
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

  it('should add a notification when the cluster release channel does not match the default one', function () {
    FusionClusterService.getOrgSettings.returns($q.resolve({ expresswayClusterReleaseChannel: 'beta' }));
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    FeatureToggleService.supports.returns($q.resolve(true));

    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    $rootScope.$digest();

    expect(NotificationService.getNotificationLength()).toEqual(1);
    var notification = NotificationService.getNotifications()[0];
    expect(notification.id).toEqual('defaultReleaseChannel' + okClusterMockData.id);
    expect(notification.data.clusterId).toEqual(okClusterMockData.id);
    expect(notification.data.clusterName).toEqual(okClusterMockData.name);
    expect(notification.data.currentReleaseChannel).toBeDefined();
    expect(notification.data.defaultReleaseChannel).toBeDefined();
  });

  it('should add and clear service alarms', function () {
    ClusterService.getClustersByConnectorType.returns([okClusterMockData]);
    FeatureToggleService.supports.returns($q.resolve(false));

    FusionClusterService.getAlarms.returns($q.resolve([
      {
        alarmId: '1234',
        key: 'c_cal.shitHitTheFan',
        severity: 'error',
        title: 'Shit is flying all over the place',
        description: 'And it might hit someone in the face'
      }
    ]));

    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    $rootScope.$digest();

    expect(NotificationService.getNotificationLength()).toEqual(1);
    var notification = NotificationService.getNotifications()[0];
    expect(notification.id).toEqual('serviceAlarm_c_cal.shitHitTheFan_1234');
    expect(notification.data.alarmId).toEqual('1234');
    expect(notification.data.severity).toEqual('error');
    expect(notification.data.title).toEqual('Shit is flying all over the place');

    // Previous error alarm is cleared and a warning is raised
    FusionClusterService.getAlarms.returns($q.resolve([
      {
        alarmId: '4567',
        key: 'c_cal.anotherOneBitesTheDust',
        severity: 'warning',
        title: 'I am not feelin well, man',
        description: 'Might wanna check it out!'
      }
    ]));

    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    $rootScope.$digest();

    expect(NotificationService.getNotificationLength()).toEqual(1);
    notification = NotificationService.getNotifications()[0];
    expect(notification.id).toEqual('serviceAlarm_c_cal.anotherOneBitesTheDust_4567');
    expect(notification.data.alarmId).toEqual('4567');
    expect(notification.data.severity).toEqual('warning');
    expect(notification.data.title).toEqual('I am not feelin well, man');

    // Clear all alarms
    FusionClusterService.getAlarms.returns($q.resolve([]));
    ServiceStateChecker.checkState('c_cal', 'squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });
});
