import { PropertyConstants } from './context-property-service';

describe('PropertyService', () => {
  let propertyResponse;
  const managementUrl: string = 'https://management.produs1.ciscoccservice.com';
  const BASE_PROP_URL = managementUrl + PropertyConstants.PROPERTY_URL;

  beforeEach(function () {
    this.initModules('Context');
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'PropertyService',
      'ContextDiscovery',
    );
    spyOn(this.ContextDiscovery, 'getEndpointForService').and.returnValue(this.$q.resolve(managementUrl));

  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getProperty', () => {
    const orgId: string = '4f9178e2-8b6f-4db3-a00f-a723c3b709e9';
    it('should get the property with correct value', function () {
      propertyResponse = {
        name: 'org.max.fields.org.4f9178e2-8b6f-4db3-a00f-a723c3b709e9',
        value: '1000',
        beanUri: 'propertyName/org.max.fields.org.4f9178e2-8b6f-4db3-a00f-a723c3b709e9',
        refUrl: PropertyConstants.PROPERTY_URL + 'org.max.fields.org.4f9178e2-8b6f-4db3-a00f-a723c3b709e9',
        id: 'org.max.fields.org.4f9178e2-8b6f-4db3-a00f-a723c3b709e9',
      };
      this.$httpBackend.expectGET(BASE_PROP_URL + 'org.max.fields.org.' + orgId).respond(200, propertyResponse);

      this.PropertyService.getProperty('org.max.fields', orgId)
        .then(function (value) {
          expect(value).toBe(1000);
        })
        .catch(fail);
      this.$httpBackend.flush();
    });

    it('should reject if error returns', function () {
      this.$httpBackend.expectGET(BASE_PROP_URL + 'org.max.fields.org.' + orgId).respond(401, 'some error');
      this.PropertyService.getProperty('org.max.fields', orgId)
        .then(fail)
        .catch(function (errorResponse) {
          expect(errorResponse.status).toBe(401);
          expect(errorResponse.data).toBe('some error');
        });
      this.$httpBackend.flush();
    });

    it('should reject if the value is not a number', function () {
      propertyResponse = {
        name: 'org.max.fields.org.4f9178e2-8b6f-4db3-a00f-a723c3b709e9',
        value: 'someDummy',
        beanUri: 'propertyName/org.max.fields.org.4f9178e2-8b6f-4db3-a00f-a723c3b709e9',
        refUrl: PropertyConstants.PROPERTY_URL + 'org.max.fields.org.4f9178e2-8b6f-4db3-a00f-a723c3b709e9',
        id: 'org.max.fields.org.4f9178e2-8b6f-4db3-a00f-a723c3b709e9',
      };
      this.$httpBackend.expectGET(BASE_PROP_URL + 'org.max.fields.org.' + orgId).respond(200, propertyResponse);
      this.PropertyService.getProperty('org.max.fields', orgId)
        .then(fail)
        .catch(function (error) {
          expect(error).toBe('Not a number');
        });
      this.$httpBackend.flush();
    });
  });

});
