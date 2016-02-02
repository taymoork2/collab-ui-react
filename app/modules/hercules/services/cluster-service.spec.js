'use strict';

describe('Service: ClusterService', function () {
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
    expect(clusterCache['cluster_0']).toBeDefined();
  });

  it('should aggregates useful data and prove it with getClustersById', function () {
    // should be several tests to make it more clear
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
            alarms: [{
              description: ''
            }],
            hostname: 'host1.example.com',
            state: 'running',
            upgradeState: 'upgraded',
            connectorType: 'c_mgmt'
          },
          {
            alarms: [],
            hostname: 'host1.example.com',
            state: 'running',
            upgradeState: 'upgraded',
            connectorType: 'c_ucmc'
          },
          {
            alarms: [],
            hostname: 'host1.example.com',
            state: 'running',
            upgradeState: 'upgraded',
            connectorType: 'c_cal'
          },
          {
            alarms: [],
            hostname: 'host2.example.com',
            state: 'running',
            upgradeState: 'upgraded',
            connectorType: 'c_mgmt'
          },
          {
            alarms: [],
            hostname: 'host2.example.com',
            state: 'registered',
            upgradeState: 'upgraded',
            connectorType: 'c_ucmc'
          },
          {
            alarms: [],
            hostname: 'host2.example.com',
            state: 'running',
            upgradeState: 'upgrading',
            connectorType: 'c_cal'
          }]
        }]
      });

    Service.fetch();
    $httpBackend.flush();

    var aggregates = Service.getClustersById('cluster_0').aggregates;
    expect(aggregates).toBeDefined();

    expect(aggregates.c_mgmt).toBeDefined();
    expect(aggregates.c_mgmt.alarms.length).toBe(1);
    expect(aggregates.c_mgmt.hosts.length).toBe(2);
    expect(aggregates.c_mgmt.runningState).toBe('has_alarms');
    expect(aggregates.c_mgmt.runningStateSeverity).toBe('error');

    expect(aggregates.c_ucmc).toBeDefined();
    expect(aggregates.c_ucmc.runningState).toBe('registered');
    expect(aggregates.c_ucmc.runningStateSeverity).toBe('warning');
    expect(aggregates.c_ucmc.upgradeState).toBe('upgraded');

    expect(aggregates.c_cal).toBeDefined();
    expect(aggregates.c_cal.runningState).toBe('running');
    expect(aggregates.c_cal.runningStateSeverity).toBe('ok');
    expect(aggregates.c_cal.upgradeState).toBe('upgrading');
  });

  it('should give clusters by connector type', function () {
    // should be several tests to make it more clear
    $httpBackend
      .when('GET', rootPathV2 + '?fields=@wide')
      .respond({
        id: 'org_0',
        name: 'Org',
        clusters: [{
          id: 'cluster_0',
          name: 'Cluster 0',
          state: 'fused',
          connectors: [{
            alarms: [],
            hostname: 'host1.example.com',
            state: 'running',
            upgradeState: 'upgraded',
            connectorType: 'c_mgmt'
          },
          {
            alarms: [],
            hostname: 'host1.example.com',
            state: 'running',
            upgradeState: 'upgraded',
            connectorType: 'c_ucmc'
          }]
        },
        {
          id: 'cluster_1',
          name: 'Cluster 1',
          state: 'fused',
          connectors: [{
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

    // getClustersByConnectorType = get clusters who has at least
    // a connector with that type
    expect(Service.getClustersByConnectorType('c_mgmt').length).toBe(2);
    expect(Service.getClustersByConnectorType('c_ucmc').length).toBe(1);
  });

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

  it('should get a connector', function () {
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

  it('should delete a host', function () {
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
