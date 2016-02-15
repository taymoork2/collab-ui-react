'use strict';

fdescribe('ClusterService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, $location, Service, authinfo;
  var rootPathV1 = 'https://hercules-integration.wbx2.com/v1/organizations/orgId';
  var rootPathV2 = 'https://hercules-integration.wbx2.com/hercules/api/v2/organizations/orgId';

  beforeEach(function () {
    module(function ($provide) {
      authinfo = {
        getOrgId: sinon.stub()
      };
      authinfo.getOrgId.returns('orgId');
      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function ($injector, _$location_, _ClusterService_) {
    Service = _ClusterService_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
    $location = _$location_;
  }));

  describe('get and fetch functions', function () {
    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should fetch and return data from the correct backend', function () {
      $httpBackend
        .when('GET', rootPathV2 + '?fields=@wide')
        .respond({
          id: 'org_0',
          name: 'Org',
          clusters: [{
            id: 'cluster_0',
            name: 'Cluster',
            state: 'fused',
            connectors: [{
              alarms: [],
              hostname: 'host.example.com',
              state: 'running',
              connectorType: 'c_mgmt'
            }]
          }]
        });

      var callback = sinon.stub();
      Service.fetch().then(callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
      var clusterCache = callback.args[0][0];
      expect(clusterCache['c_mgmt']['cluster_0']).toBeDefined();
    });

    it('should separate data around connector types', function () {
      $httpBackend
        .when('GET', rootPathV2 + '?fields=@wide')
        .respond({
          id: 'org_0',
          name: 'Org',
          clusters: [{
            id: 'cluster_0',
            name: 'Cluster',
            state: 'fused',
            provisioning: [],
            connectors: [{
              alarms: [],
              hostname: 'host1.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            }, {
              alarms: [],
              hostname: 'host1.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_ucmc'
            }, {
              alarms: [],
              hostname: 'host1.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_cal'
            }]
          }]
        });

      Service.fetch();
      $httpBackend.flush();

      var c_mgmt = Service.getClustersByConnectorType('c_mgmt');
      expect(c_mgmt.length).toBe(1);
      var c_ucmc = Service.getClustersByConnectorType('c_ucmc');
      expect(c_ucmc.length).toBe(1);
      var c_cal = Service.getClustersByConnectorType('c_cal');
      expect(c_cal.length).toBe(1);
    });

    it('should not expose a cluster if it has 0 connectors of the type we want', function () {
      $httpBackend
        .when('GET', rootPathV2 + '?fields=@wide')
        .respond({
          id: 'org_0',
          name: 'Org',
          clusters: [{
            id: 'cluster_0',
            name: 'Cluster',
            state: 'fused',
            provisioning: [],
            connectors: [{
              alarms: [],
              hostname: 'host1.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            }]
          }]
        });

      Service.fetch();
      $httpBackend.flush();

      var c_mgmt = Service.getClustersByConnectorType('c_mgmt');
      expect(c_mgmt.length).toBe(1);
      var c_ucmc = Service.getClustersByConnectorType('c_ucmc');
      expect(c_ucmc.length).toBe(0);
      var c_cal = Service.getClustersByConnectorType('c_cal');
      expect(c_cal.length).toBe(0);
    });

    it('should add aggregates and not touch the other information of the clusters', function () {
      $httpBackend
        .when('GET', rootPathV2 + '?fields=@wide')
        .respond({
          id: 'org_0',
          name: 'Org',
          clusters: [{
            id: 'cluster_0',
            name: 'Cluster',
            state: 'fused',
            provisioning: [],
            connectors: [{
              alarms: [],
              hostname: 'host1.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            }]
          }]
        });

      Service.fetch();
      $httpBackend.flush();

      var c_mgmt = Service.getCluster('c_mgmt', 'cluster_0');
      expect(c_mgmt.id).toBe('cluster_0');
      expect(c_mgmt.name).toBe('Cluster');
      expect(c_mgmt.state).toBe('fused');
      expect(c_mgmt.provisioning).toEqual([]);
      expect(c_mgmt.connectors).toEqual([{
        alarms: [],
        hostname: 'host1.example.com',
        state: 'running',
        upgradeState: 'upgraded',
        connectorType: 'c_mgmt'
      }]);
      expect(c_mgmt.aggregates).toBeDefined();
    });

    it('should merge all alarms and override state if it has some', function () {
      $httpBackend
        .when('GET', rootPathV2 + '?fields=@wide')
        .respond({
          id: 'org_0',
          name: 'Org',
          clusters: [{
            id: 'cluster_0',
            name: 'Cluster',
            state: 'fused',
            provisioning: [],
            connectors: [{
              alarms: [{
                description: ''
              }],
              hostname: 'host1.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            },
            {
              alarms: [{
                description: ''
              },
              {
                description: ''
              }],
              hostname: 'host2.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            }]
          }]
        });

      Service.fetch();
      $httpBackend.flush();

      var c_mgmt = Service.getCluster('c_mgmt', 'cluster_0');
      expect(c_mgmt.aggregates.alarms.length).toBe(3);
      expect(c_mgmt.aggregates.state).toBe('has_alarms');
    });

    it('should merge running state', function () {
      $httpBackend
        .when('GET', rootPathV2 + '?fields=@wide')
        .respond({
          id: 'org_0',
          name: 'Org',
          clusters: [{
            id: 'cluster_0',
            name: 'Cluster',
            state: 'fused',
            provisioning: [],
            connectors: [{
              alarms: [],
              hostname: 'host1.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            },
            {
              alarms: [],
              hostname: 'host2.example.com',
              state: 'not_configured',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            }]
          }]
        });

      Service.fetch();
      $httpBackend.flush();

      var c_mgmt = Service.getCluster('c_mgmt', 'cluster_0');
      expect(c_mgmt.aggregates.state).toBe('not_configured');
    });

    it('should merge get upgrade state', function () {
      $httpBackend
        .when('GET', rootPathV2 + '?fields=@wide')
        .respond({
          id: 'org_0',
          name: 'Org',
          clusters: [{
            id: 'cluster_0',
            name: 'Cluster',
            state: 'fused',
            provisioning: [],
            connectors: [{
              alarms: [],
              hostname: 'host1.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            },
            {
              alarms: [],
              hostname: 'host2.example.com',
              state: 'running',
              upgradeState: 'upgrading',
              connectorType: 'c_mgmt'
            }]
          }]
        });

      Service.fetch();
      $httpBackend.flush();

      var c_mgmt = Service.getCluster('c_mgmt', 'cluster_0');
      expect(c_mgmt.aggregates.upgradeState).toBe('upgrading');
    });

    it('should expose that an is upgrade available when there is one', function () {
      $httpBackend
        .when('GET', rootPathV2 + '?fields=@wide')
        .respond({
          id: 'org_0',
          name: 'Org',
          clusters: [{
            id: 'cluster_0',
            name: 'Cluster',
            state: 'fused',
            provisioning: [{
              connectorType: 'c_mgmt',
              availableVersion: '2.0',
              provisionedVersion: '1.0',
            }],
            connectors: [{
              alarms: [],
              hostname: 'host1.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            }]
          }]
        });

      Service.fetch();
      $httpBackend.flush();

      var c_mgmt = Service.getCluster('c_mgmt', 'cluster_0');
      expect(c_mgmt.aggregates.provisioning).toEqual({
        connectorType: 'c_mgmt',
        availableVersion: '2.0',
        provisionedVersion: '1.0',
      });
      expect(c_mgmt.aggregates.upgradeAvailable).toBe(true);
    });

    // should set .hosts with nice data
    it('should add hosts to aggregates', function () {
      $httpBackend
        .when('GET', rootPathV2 + '?fields=@wide')
        .respond({
          id: 'org_0',
          name: 'Org',
          clusters: [{
            id: 'cluster_0',
            name: 'Cluster',
            state: 'fused',
            provisioning: [],
            connectors: [{
              alarms: [],
              hostname: 'host1.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            },
            {
              alarms: [],
              hostname: 'host2.example.com',
              state: 'running',
              upgradeState: 'upgraded',
              connectorType: 'c_mgmt'
            }]
          }]
        });

      Service.fetch();
      $httpBackend.flush();

      var c_mgmt = Service.getCluster('c_mgmt', 'cluster_0');
      expect(c_mgmt.aggregates.hosts.length).toBe(2);
      expect(c_mgmt.aggregates.hosts[0]).toEqual({
        alarms: [],
        hostname: 'host1.example.com',
        state: 'running',
        upgradeState: 'upgraded'
      });
    });

    it('should call error callback on failure', function () {
      $httpBackend
        .when('GET', rootPathV2 + '?fields=@wide')
        .respond(500, null);

      var callback = sinon.stub();
      Service.fetch().then(null, callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
    });
  });

  describe('getRunningStateSeverity', function () {
    it('should have an idea of which state is more critical than another', function () {
      // $httpBackend.when('GET', rootPathV2 + '?fields=@wide').respond({}); // please $httpBackend
      // $httpBackend.flush();
      var severity = Service.getRunningStateSeverity('not_installed');
      expect(severity.label).toBeDefined();
      expect(severity.value).toBeDefined();
      expect(severity.label).toBe('neutral');
      expect(severity.value).toBe(1);
    });

    it('should default to error when the state is no known', function () {
      // $httpBackend.when('GET', rootPathV2 + '?fields=@wide').respond({}); // please $httpBackend
      // $httpBackend.flush();
      var severity = Service.getRunningStateSeverity('platypus');
      expect(severity.label).toBe('error');
      expect(severity.value).toBe(3);
    });
  });

  describe('upgradeSoftware', function () {
    it('should upgrade software using the correct backend', function () {
      $httpBackend.when('GET', rootPathV2 + '?fields=@wide').respond({}); // please $httpBackend
      $httpBackend
        .when('POST', rootPathV1 + '/clusters/foo/services/bar/upgrade', {})
        .respond({
          foo: 'bar'
        });

      var callback = sinon.stub();
      Service.upgradeSoftware('foo', 'bar').then(callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
      expect(callback.args[0][0].foo).toBe('bar');
    });

    it('software upgrade should fail on 500 errors', function () {
      $httpBackend.when('GET', rootPathV2 + '?fields=@wide').respond({}); // please $httpBackend
      $httpBackend
        .when('POST', rootPathV1 + '/clusters/foo/services/bar/upgrade', {})
        .respond(500, {
          foo: 'bar'
        });

      var callback = sinon.stub();
      Service.upgradeSoftware('foo', 'bar').then(undefined, callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
      expect(callback.args[0][0]).not.toBe(null);
    });
  });

  it('should let us a connector', function () {
    $httpBackend.when('GET', rootPathV2 + '?fields=@wide').respond({}); // please $httpBackend
    $httpBackend
      .when('GET', rootPathV1 + '/connectors/123', {})
      .respond({
        foo: 'bar'
      });

    var callback = sinon.stub();
    Service.getConnector('123').then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0].foo).toBe('bar');
  });

  it('should be able to delete a host', function () {
    // TODO: test the .then part of deleting a host (hosts.length === 0 => delete cluster)
    $httpBackend.when('GET', rootPathV2 + '?fields=@wide').respond({}); // please $httpBackend
    $httpBackend
      .when('DELETE', rootPathV1 + '/clusters/clusterid/hosts/serial')
      .respond(200);

    var callback = sinon.stub();
    Service.deleteHost('clusterid', 'serial').then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });

  it('should handle host deletion failures', function () {
    $httpBackend.when('GET', rootPathV2 + '?fields=@wide').respond({}); // please $httpBackend
    $httpBackend
      .when('DELETE', rootPathV1 + '/clusters/clusterid/hosts/serial')
      .respond(500);

    var callback = sinon.stub();
    Service.deleteHost('clusterid', 'serial').then(undefined, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });

  it('should be able to delete a cluster', function () {
    // TODO: test the .then part of deleting a cluster
    $httpBackend.when('GET', rootPathV2 + '?fields=@wide').respond({}); // please $httpBackend
    $httpBackend
      .when('DELETE', rootPathV1 + '/clusters/abc', {})
      .respond(200);

    var callback = sinon.stub();
    Service.deleteCluster('abc').then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });
});
