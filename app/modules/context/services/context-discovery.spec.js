'use strict';

describe('Service: Cotext Discovery factory', function () {
  var contextDiscoveryUrl;
  var discoveryData = [
    {
      service: 'context',
      endpoints: [{ priority: 1, location: 'https://context-service.produs1.ciscoccservice.com' }],
      lastUpdated: '2015-10-19T14:29:08.216Z',
    },
    {
      service: 'dictionary',
      endpoints: [{ priority: 1, location: 'https://dictionary.produs1.ciscoccservice.com' }],
      lastUpdated: '2015-10-19T14:29:08.216Z',
    },
    {
      service: 'management',
      endpoints: [{ priority: 1, location: 'https://management.produs1.ciscoccservice.com' }],
      lastUpdated: '2015-10-19T14:29:08.216Z',
    }];

  var badDiscoveryData = [
    {
      service: 'dictionary',
      endpoints: [{ priority: 1, location: 'https://dictionary.produs1.ciscoccservice.com' }],
      lastUpdated: '2015-10-19T14:29:08.216Z',
    },
    {
      service: 'eventing',
      endpoints: [{ priority: 1, location: 'https://eventing.produs1.ciscoccservice.com' }],
      lastUpdated: '2015-10-19T14:29:08.216Z',
    }];

  var anotherDiscoveryData = [
    {
      service: 'dictionary',
      endpoints: [{ priority: 1, location: 'https://another-dictionary.produs2.ciscoccservice.com' }],
      lastUpdated: '2015-10-19T14:29:08.216Z',
    },
    {
      service: 'management',
      endpoints: [{ priority: 1, location: 'https://management.produs2.ciscoccservice.com' }],
      lastUpdated: '2015-10-19T14:29:08.216Z',
    }];

  beforeEach(function () {
    this.initModules('Context');
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'Discovery',
      'UrlConfig'
    );
    contextDiscoveryUrl = this.UrlConfig.getContextDiscoveryServiceUrl();

    installPromiseMatchers();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get service urls', function () {
    this.$httpBackend.whenGET(contextDiscoveryUrl).respond(200, discoveryData);
    this.Discovery.getEndpointForService('dictionary').then(function (data) {
      expect(data).toBe('https://dictionary.produs1.ciscoccservice.com');
    });
    this.Discovery.getEndpointForService('context').then(function (data) {
      expect(data).toBe('https://context-service.produs1.ciscoccservice.com');
    });
    this.$httpBackend.flush();
  });

  it('should get error if no service name provided', function () {
    var deferred = this.$q.defer();
    spyOn(this.$q, 'reject').and.returnValue(deferred.promise);
    this.Discovery.getEndpointForService('').then(fail)
      .catch(function (error) {
        expect(error).toBe('No service name specified.');
      });
    this.Discovery.getEndpointForService().catch(function (error) {
      expect(error).toBe('No service name specified.');
    });
  });

  it('should get error if non-existing service name provided', function () {
    this.$httpBackend.whenGET(contextDiscoveryUrl).respond(200, discoveryData);
    this.Discovery.getEndpointForService('dummyService').then(fail)
      .catch(function (error) {
        expect(error).toBe('Context Service Dictionary endpoint not found.');
      });
    this.$httpBackend.flush();
  });

  it('should get error when HTTP response GET discovery Url fails', function () {
    this.$httpBackend.whenGET(contextDiscoveryUrl).respond(500, 'This is error data from http server');
    this.Discovery.getEndpointForService('dictionary')
      .then(fail)
      .catch(function (errorResponse) {
        expect(errorResponse.data).toBe('This is error data from http server');
        expect(errorResponse.status).toBe(500);
      });
    this.$httpBackend.flush();
  });

  it('should get error when response to get discovery Url does not contain discovery endpoint', function () {
    this.$httpBackend.whenGET(contextDiscoveryUrl).respond(500, badDiscoveryData, 'Error happened');
    this.Discovery.getEndpointForService('dictionary')
      .then(fail)
      .catch(function (response) {
        expect(response.status).toBe(500);
      });
    this.$httpBackend.flush();
  });

  it('should not discovery another dictionary endpoint after it has it (factory behavior)', function () {
    this.$httpBackend.whenGET(contextDiscoveryUrl).respond(200, discoveryData);
    this.Discovery.getEndpointForService('dictionary').then(function (data) {
      expect(data).toBe('https://dictionary.produs1.ciscoccservice.com');
    });
    //flush http response and return differnet endpoint=> it should not change the end result
    this.$httpBackend.flush();
    this.$httpBackend.whenGET(contextDiscoveryUrl).respond(200, anotherDiscoveryData);
    var promise = this.Discovery.getEndpointForService('dictionary');
    expect(promise).toBeResolvedWith('https://dictionary.produs1.ciscoccservice.com');
    //no need to flush http reponse, since get on it was not invoked
  });
});
