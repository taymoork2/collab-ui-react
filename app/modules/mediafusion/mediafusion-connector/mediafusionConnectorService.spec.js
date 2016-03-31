'use strict';

describe('Service: MediafusionClusterService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, $location, Service, converter, authinfo;
  var rootPath = 'https://hercules-integration.wbx2.com/v1/organizations/orgId';
  var urlPath = 'https://hercules-integration.wbx2.com/v1/organizations';

  beforeEach(function () {
    module(function ($provide) {
      converter = {
        convertClusters: sinon.stub()
      };
      $provide.value('ConverterService', converter);
    });
  });

  beforeEach(inject(function ($injector, _$location_, _MediafusionClusterService_, _Authinfo_) {
    authinfo = _Authinfo_;
    authinfo.getOrgId = sinon.stub().returns("orgId");

    Service = _MediafusionClusterService_;
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
      .when('GET', rootPath + '/clusters')
      .respond('foo');

    converter.convertClusters.returns({
      id: 'foo'
    });

    var callback = sinon.stub();
    Service.fetch(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });

  it('should get the group from correct backend', function () {
    $httpBackend
      .when('GET', rootPath + '/property_sets' + '?' + 'type=' + 'mf.group')
      .respond(200);

    var callback = sinon.stub();
    Service.getGroups().then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeFalsy();

  });

  it('should fail when 500 is hit', function () {
    $httpBackend
      .when('GET', rootPath + '/property_sets' + '?' + 'type=' + 'mf.group')
      .respond(500);

    var callback = sinon.stub();
    Service.getGroups().then(undefined, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();

  });

  it('should Defuse the connector from correct backend', function () {
    $httpBackend
      .when(
        'DELETE',
        rootPath + '/clusters/clusterid'
      ).respond(200);

    var callback = sinon.stub();
    Service.defuseConnector('clusterid', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeFalsy();
    expect(callback.args[0][1]).toBeTruthy();
  });

  it('should handle defuse connector failures', function () {
    $httpBackend
      .when(
        'DELETE',
        rootPath + '/clusters/clusterid'
      ).respond(500);

    var callback = sinon.stub();
    Service.defuseConnector('clusterid', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();
    expect(callback.args[0][0]).not.toBe(null);

  });

  it('should Remove the group assignment from correct backend', function () {

    $httpBackend
      .when('DELETE', rootPath + '/clusters/clusterid/assigned_property_sets/propertySetId').respond(200);

    var callback = sinon.stub();

    var d = Service.removeGroupAssignment('clusterid', 'propertySetId').then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();

  });

  it('removeGroupAssignment should fail on 500', function () {
    $httpBackend
      .when('DELETE', rootPath + '/clusters/clusterid/assigned_property_sets/propertySetId').respond(500);

    var callback = sinon.stub();
    Service.removeGroupAssignment('clusterid', 'propertySetId').then(undefined, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();
    expect(callback.args[0][0]).not.toBe(null);

  });

  it('should update the group assignment from correct backend', function () {

    $httpBackend
      .when('POST', rootPath + '/clusters/clusterid/assigned_property_sets').respond(200);

    var callback = sinon.stub();

    Service.updateGroupAssignment('clusterid', 'propertySetId').then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();

  });

  it('updateGroupAssignment should fail on 500', function () {
    $httpBackend
      .when('POST', rootPath + '/clusters/clusterid/assigned_property_sets').respond(500);

    var callback = sinon.stub();
    Service.updateGroupAssignment('clusterid', 'propertySetId').then(undefined, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();
    expect(callback.args[0][0]).not.toBe(null);
  });

  it('should create a group with Groupname', function () {

    $httpBackend.whenPOST(rootPath + '/property_sets').respond(200, {
      "grp": [{
        'orgId': "121",
        'type': 'mf.group',
        'name': "groupName",
        'properties': {
          'mf.group.displayName': "mf_group"
        }
      }]
    });

    var callback = sinon.stub();

    Service.createGroup('groupName').then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();
    Service.createGroup('groupName', function (data, status) {
      expect(status).toBe(200);

      expect(data.grp.orgId).toBe('121');
      expect(data.grp.type).toBe('mf.group');

    });

    $httpBackend.flush();

  });

  it('Should be able to Change roles for a particular group', function () {

    $httpBackend
      .when('POST', rootPath + '/clusters/clusterid/properties')
      .respond({
        "grp": [{
          'mf.role': "roles"
        }]
      });

    var callback = sinon.stub();

    Service.changeRole('roles', 'clusterid').then(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();

    Service.changeRole('roles', 'clusterid', function (data, status) {

      expect(data.grp.mf.role).toBe('roles');

    });
    $httpBackend.flush();
  });

});
