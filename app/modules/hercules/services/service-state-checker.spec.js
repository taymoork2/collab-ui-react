'use strict';

describe('Service: ServiceStateChecker', function () {
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(angular.mock.module('Hercules'));

  var $q, $rootScope, $httpBackend, HybridServicesClusterService, NotificationService, ServiceStateChecker, USSService, ServiceDescriptorService, DomainManagementService, FeatureToggleService, FmsOrgSettings, HybridServicesExtrasService, Orgservice;

  var okClusterMockData = {
    id: 0,
    name: 'Tom is Awesome!',
    releaseChannel: 'stable',
    targetType: 'c_mgmt',
    provisioning: [{
      connectorType: 'c_mgmt',
    }, {
      connectorType: 'c_cal',
    }],
    connectors: [{
      connectorType: 'c_mgmt',
      state: 'running',
    }, {
      connectorType: 'c_cal',
      state: 'running',
    }, {
      connectorType: 'c_cal',
      state: 'running',
    }],
  };

  function mockDependencies($provide) {
    $provide.value('CsdmPoller', {
      create: jasmine.createSpy('create').and.returnValue({
        forceAction: jasmine.createSpy('forceAction'),
      }),
    });
    $provide.value('Authinfo', {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue('orgId'),
    });
  }

  beforeEach(inject(function (_$q_, _$httpBackend_, _$rootScope_, _NotificationService_, _HybridServicesClusterService_, _FeatureToggleService_, _ServiceStateChecker_, _DomainManagementService_, _Orgservice_, _ServiceDescriptorService_, _USSService_, _FmsOrgSettings_, _HybridServicesExtrasService_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    NotificationService = _NotificationService_;
    FeatureToggleService = _FeatureToggleService_;
    HybridServicesExtrasService = _HybridServicesExtrasService_;
    ServiceStateChecker = _ServiceStateChecker_;
    DomainManagementService = _DomainManagementService_;
    Orgservice = _Orgservice_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    USSService = _USSService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    FmsOrgSettings = _FmsOrgSettings_;

    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
    HybridServicesClusterService.getAll = jasmine.createSpy('getAll').and.returnValue($q.resolve([]));
    DomainManagementService.getVerifiedDomains = jasmine.createSpy('getVerifiedDomains').and.returnValue($q.resolve([{
      domain: 'somedomain',
    }]));
    FeatureToggleService.supports = jasmine.createSpy('supports').and.returnValue($q.resolve(false));
    FmsOrgSettings.get = jasmine.createSpy('get').and.returnValue($q.resolve({ expresswayClusterReleaseChannel: 'stable' }));
    Orgservice.getOrg = jasmine.createSpy('getOrg');
    ServiceDescriptorService.isServiceEnabled = jasmine.createSpy('isServiceEnabled');
    ServiceDescriptorService.getServices = jasmine.createSpy('getServices');
    USSService.getOrg = jasmine.createSpy('getOrg');
    USSService.getOrgId = jasmine.createSpy('getOrgId');
    USSService.getStatusesSummary = jasmine.createSpy('getStatusesSummary').and.returnValue({});
    HybridServicesExtrasService.getAlarms = jasmine.createSpy('getAlarms').and.returnValue($q.resolve([]));
  }));

  it('should raise the "fuseNotPerformed" message if there are no connectors', function () {
    HybridServicesClusterService.getAll.and.returnValue($q.resolve([]));
    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('fuseNotPerformed');
  });

  it('should clear the "fuseNotPerformed" message when fusing a cluster ', function () {
    HybridServicesClusterService.getAll.and.returnValue($q.resolve([]));
    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('fuseNotPerformed');
    HybridServicesClusterService.getAll.and.returnValue($q.resolve([okClusterMockData]));
    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should raise the "noUsersActivated" message and clear appropriately when there are no users activated ', function () {
    USSService.getStatusesSummary.and.returnValue({
      'squared-fusion-cal': {
        activated: 0,
        error: 0,
        notActivated: 0,
      },
    });

    HybridServicesClusterService.getAll.and.returnValue($q.resolve([okClusterMockData]));
    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-cal:noUsersActivated');
    USSService.getStatusesSummary.and.returnValue({
      'squared-fusion-cal': {
        activated: 1,
      },
    });
    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should raise the "userErrors" message and clear appropriately when there are users with errors ', function () {
    USSService.getStatusesSummary.and.returnValue({
      'squared-fusion-cal': {
        activated: 0,
        error: 5,
        notActivated: 0,
      },
    });
    HybridServicesClusterService.getAll.and.returnValue($q.resolve([okClusterMockData]));
    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('squared-fusion-cal:userErrors');
    USSService.getStatusesSummary.and.returnValue({
      'squared-fusion-cal': {
        activated: 1,
      },
    });
    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should clear connect available notification when connect is configured ', function () {
    USSService.getStatusesSummary.and.returnValue({
      'squared-fusion-uc': {
        activated: 1,
        error: 0,
        notActivated: 0,
      },
    });

    USSService.getOrgId.and.returnValue('orgId');
    USSService.getOrg.and.returnValue($q.resolve({}));
    HybridServicesClusterService.getAll.and.returnValue($q.resolve([okClusterMockData]));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));
    ServiceDescriptorService.getServices.and.returnValue($q.resolve(
      [{
        id: 'squared-fusion-ec',
        enabled: false, // will spawn a 'connect available' notification,
      }]
    ));

    ServiceStateChecker.checkState('squared-fusion-uc');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('callServiceConnectAvailable');

    // this should remove the connect notifications
    ServiceDescriptorService.getServices.and.returnValue($q.resolve(
      [{
        id: 'squared-fusion-ec',
        enabled: true,
      }]
    ));
    USSService.getOrg.and.returnValue($q.resolve({ sipDomain: 'example.com' }));

    ServiceStateChecker.checkState('squared-fusion-uc');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should add and correctly clear the domain verification', function () {
    USSService.getOrgId.and.returnValue('orgId');
    USSService.getOrg.and.returnValue($q.resolve({ sipDomain: 'example.com' }));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));
    HybridServicesClusterService.getAll.and.returnValue($q.resolve([okClusterMockData]));
    ServiceDescriptorService.getServices.and.returnValue($q.resolve([{
      id: 'squared-fusion-ec',
      enabled: true,
    }])
    );
    USSService.getStatusesSummary.and.returnValue({
      'squared-fusion-uc': {
        activated: 1,
        error: 0,
        notActivated: 0,
      },
    });

    // this should spawn a domain verification notification
    DomainManagementService.getVerifiedDomains = jasmine.createSpy('getVerifiedDomains').and.returnValue($q.resolve([]));

    ServiceStateChecker.checkState('squared-fusion-uc');
    $rootScope.$digest();

    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('noDomains');

    // Domain added, should clear the notification
    DomainManagementService.getVerifiedDomains = jasmine.createSpy('getVerifiedDomains').and.returnValue($q.resolve([{
      domain: 'somedomain',
    }]));
    ServiceDescriptorService.getServices.and.returnValue($q.resolve(
      [{
        id: 'squared-fusion-ec',
        enabled: true,
      }]
    ));

    ServiceStateChecker.checkState('squared-fusion-uc');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });

  it('should add sip uri domain notification when sip uri domain is not set ', function () {
    FmsOrgSettings.get.and.returnValue($q.resolve({ expresswayClusterReleaseChannel: 'stable' }));
    USSService.getStatusesSummary.and.returnValue({
      'squared-fusion-uc': {
        activated: 1,
        error: 0,
        notActivated: 0,
      },
    });
    USSService.getOrgId.and.returnValue('orgId');
    USSService.getOrg.and.returnValue($q.resolve({
      sipDomain: 'somedomain',
    }));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    ServiceDescriptorService.getServices.and.returnValue($q.resolve(
      [{
        id: 'squared-fusion-ec',
        enabled: true, // will spawn a 'connect available' notification,
      }]
    ));

    HybridServicesClusterService.getAll.and.returnValue($q.resolve([okClusterMockData]));
    FeatureToggleService.supports.and.returnValue($q.resolve(true));
    Orgservice.getOrg = function (cb) {
      cb({}, 200);
    };

    ServiceStateChecker.checkState('squared-fusion-uc');
    $rootScope.$digest();

    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('sipUriDomainEnterpriseNotConfigured');
  });

  it('should remove sip uri domain notification when sip uri domain is set', function () {
    FmsOrgSettings.get.and.returnValue($q.resolve({ expresswayClusterReleaseChannel: 'stable' }));
    USSService.getStatusesSummary.and.returnValue({
      'squared-fusion-uc': {
        activated: 1,
        error: 0,
        notActivated: 0,
      },
    });
    USSService.getOrgId.and.returnValue('orgId');
    USSService.getOrg.and.returnValue($q.resolve({
      sipDomain: 'somedomain',
    }));
    ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));

    ServiceDescriptorService.getServices.and.returnValue($q.resolve(
      [{
        id: 'squared-fusion-ec',
        enabled: true,
      }]
    ));


    HybridServicesClusterService.getAll.and.returnValue($q.resolve([okClusterMockData]));
    FeatureToggleService.supports.and.returnValue($q.resolve(true));
    Orgservice.getOrg = function (cb) {
      cb({}, 200);
    };

    ServiceStateChecker.checkState('squared-fusion-uc');
    $rootScope.$digest();

    expect(NotificationService.getNotificationLength()).toEqual(1);
    expect(NotificationService.getNotifications()[0].id).toEqual('sipUriDomainEnterpriseNotConfigured');

    // now we set the value in CI
    Orgservice.getOrg = function (cb) {
      cb({
        orgSettings: {
          sipCloudDomain: 'sipCloudDomain',
        },
      }, 200);

      ServiceStateChecker.checkState('squared-fusion-uc');
      $rootScope.$digest();

      expect(NotificationService.getNotificationLength()).toEqual(0);
    };
  });

  it('should add a notification when the cluster release channel does not match the default one', function () {
    FmsOrgSettings.get.and.returnValue($q.resolve({ expresswayClusterReleaseChannel: 'beta' }));
    HybridServicesClusterService.getAll.and.returnValue($q.resolve([okClusterMockData]));
    FeatureToggleService.supports.and.returnValue($q.resolve(true));

    ServiceStateChecker.checkState('squared-fusion-cal');
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
    HybridServicesClusterService.getAll.and.returnValue($q.resolve([okClusterMockData]));
    FeatureToggleService.supports.and.returnValue($q.resolve(false));

    HybridServicesExtrasService.getAlarms.and.returnValue($q.resolve([
      {
        alarmId: '1234',
        key: 'c_cal.shitHitTheFan',
        severity: 'error',
        title: 'Shit is flying all over the place',
        description: 'And it might hit someone in the face',
      },
    ]));

    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(1);
    var notification = NotificationService.getNotifications()[0];
    expect(notification.id).toEqual('serviceAlarm_c_cal.shitHitTheFan_1234');
    expect(notification.data.alarmId).toEqual('1234');
    expect(notification.data.severity).toEqual('error');
    expect(notification.data.title).toEqual('Shit is flying all over the place');

    // New check with the same alarm, should yield the same result
    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(1);
    notification = NotificationService.getNotifications()[0];
    expect(notification.id).toEqual('serviceAlarm_c_cal.shitHitTheFan_1234');
    expect(notification.data.alarmId).toEqual('1234');
    expect(notification.data.severity).toEqual('error');
    expect(notification.data.title).toEqual('Shit is flying all over the place');

    // Previous error alarm is cleared and a warning is raised
    HybridServicesExtrasService.getAlarms.and.returnValue($q.resolve([
      {
        alarmId: '4567',
        key: 'c_cal.anotherOneBitesTheDust',
        severity: 'warning',
        title: 'I am not feelin well, man',
        description: 'Might wanna check it out!',
      },
    ]));

    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(1);
    notification = NotificationService.getNotifications()[0];
    expect(notification.id).toEqual('serviceAlarm_c_cal.anotherOneBitesTheDust_4567');
    expect(notification.data.alarmId).toEqual('4567');
    expect(notification.data.severity).toEqual('warning');
    expect(notification.data.title).toEqual('I am not feelin well, man');

    // Clear all alarms
    HybridServicesExtrasService.getAlarms.and.returnValue($q.resolve([]));
    ServiceStateChecker.checkState('squared-fusion-cal');
    $rootScope.$digest();
    expect(NotificationService.getNotificationLength()).toEqual(0);
  });
});
