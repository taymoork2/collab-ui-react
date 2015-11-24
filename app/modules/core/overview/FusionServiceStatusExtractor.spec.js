'use strict';

describe('Service: ServiceStatusDecriptor', function () {
  beforeEach(module('Core'));

  var $httpBackend, $location, Service, authinfo, configService, $q;
  var rootPath = 'https://hercules-integration.wbx2.com/v1';
  var orgPath = '/organizations/orgId';

  beforeEach(function () {
    module(function ($provide) {
      authinfo = {
        getOrgId: sinon.stub()
      };
      authinfo.getOrgId.returns("orgId");
      configService = {
        getUrl: sinon.stub()
      };
      configService.getUrl.returns(rootPath);

      $provide.value('ConfigService', configService);
      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function ($injector, _$location_, _ServiceStatusDecriptor_, _$q_) {
    Service = _ServiceStatusDecriptor_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
    $location = _$location_;
    $q = _$q_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should create serviceType status map', function () {
    $httpBackend
      .when('GET', rootPath + orgPath)
      .respond(orgData);

    var callback = sinon.stub();
    Service.servicesInOrgWithStatus().then(callback);
    $httpBackend.flush();
    var res = callback.args[0][0];
    expect(callback.callCount).toBe(1);

    expect(res.c_ucmc).toBeDefined();
    expect(res.c_ucmc).toBeTruthy();

  });

  it('should create empty serviceType status map given empty data', function () {
    $httpBackend
      .when('GET', rootPath + orgPath)
      .respond('');

    var callback = sinon.stub();
    Service.servicesInOrgWithStatus().then(callback);
    $httpBackend.flush();
    var res = callback.args[0][0];
    expect(callback.callCount).toBe(1);

    expect(res).toBeDefined();
    expect(res.c_ucmc).toBeUndefined();
    expect(res.c_ucmc).toBeUndefined();

  });

  it('should create empty serviceType status map given broken data', function () {
    $httpBackend
      .when('GET', rootPath + orgPath)
      .respond('dda');

    var callback = sinon.stub();
    Service.servicesInOrgWithStatus().then(callback);
    $httpBackend.flush();
    var res = callback.args[0][0];
    expect(callback.callCount).toBe(1);

    expect(res).toBeDefined();
    expect(res.c_ucmc).toBeUndefined();
    expect(res.c_ucmc).toBeUndefined();

  });

  var orgData = '{"id":"fe5acf7a-6246-484f-8f43-3e8c910fc50d","clusters":[{"id":"8a27c29c-8c5d-11e5-ba85-005056b1274b","connectors":[{"id":"c_ucmc@058CA109","type":"c_ucmc","operational":true},{"id":"c_mgmt@058CA109","type":"c_mgmt","operational":true},{"id":"c_cal@058CA109","type":"c_cal","operational":false}],"properties":{},"assignedPropertySets":[]},{"id":"07ee39f8-8dfe-11e5-adbc-005056b12db1","connectors":[{"id":"c_mgmt@0A5E3DE8","type":"c_mgmt","operational":false},{"id":"c_cal@0A5E3DE8","type":"c_cal","operational":false},{"id":"c_ucmc@0A5E3DE8","type":"c_ucmc","operational":true}],"properties":{},"assignedPropertySets":[]}]}';
});
