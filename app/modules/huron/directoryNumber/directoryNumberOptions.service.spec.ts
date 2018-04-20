import { IDirectoryNumber, Availability, ExternalNumberType, Pattern } from './index';

describe('Service: DirectoryNumberOptionsService', () => {
  beforeEach(function () {
    this.initModules('huron.directory-number');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'FeatureToggleService',
      'HuronConfig',
      'DirectoryNumberOptionsService',
      '$q',
      'LocationsService',
      'NumberService',
      '$rootScope',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
    spyOn(this.NumberService, 'getNumberList').and.callThrough();

    const internalNumbersResponse: IDirectoryNumber[] = [
      { pattern: '12345' },
      { pattern: '67890' },
      { pattern: '75023' },
    ];

    const internalNumbers: string[] = [
      '12345',
      '67890',
      '75023',
    ];

    const externalNumbersResponse: IDirectoryNumber[] = [
      { pattern: '+12345' },
      { pattern: '+67890' },
    ];

    const externalNumbers: string[] = [
      '+12345',
      '+67890',
    ];

    this.internalNumbers = internalNumbers;
    this.externalNumbers = externalNumbers;
    this.internalNumbersResponse = internalNumbersResponse;
    this.externalNumbersResponse = externalNumbersResponse;
    this.locationId = '1234';
  });
  beforeEach(installPromiseMatchers);

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getInternalNumbers function toggle OFF', function () {

    it('should get internal numbers list', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers?assigned=false&deprecated=true&type=internal')
        .respond(200);
      this.DirectoryNumberOptionsService.getInternalNumberOptions().then(() => {
        expect(this.NumberService.getNumberList).toHaveBeenCalledWith(undefined, 'internal', false);
      });
      this.$httpBackend.flush();
    });

    it('should reject the promise on a failed response', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers?assigned=false&deprecated=true&type=internal')
        .respond(500);
      this.DirectoryNumberOptionsService.getInternalNumberOptions().then(fail)
        .catch(response => {
          expect(response.status).toBe(500);
        });
      this.$httpBackend.flush();
    });
  });

  describe('getExternalNumbers function', function () {
    it('should get external numbers list and default to query for unassigned DID numbers sorted by pattern', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/externalnumberpools?directorynumber=&externalnumbertype=Fixed+Line+or+Mobile&order=pattern')
        .respond(200, this.externalNumbersResponse);
      this.DirectoryNumberOptionsService.getExternalNumberOptions().then(response => {
        expect(response).toEqual(this.externalNumbers);
      });
      this.$httpBackend.flush();
    });

    it('should reject the promise on a failed response', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/externalnumberpools?directorynumber=&externalnumbertype=Fixed+Line+or+Mobile&order=pattern')
        .respond(500);
      this.DirectoryNumberOptionsService.getExternalNumberOptions().then(fail)
        .catch(response => {
          expect(response.status).toBe(500);
        });
      this.$httpBackend.flush();
    });

    it('should get external numbers list and query for a specific unassigned DID pattern sorted by pattern', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/externalnumberpools?directorynumber=&externalnumbertype=Fixed+Line+or+Mobile&order=pattern&pattern=%25%2B123%25')
        .respond(200, this.externalNumbersResponse);
      this.DirectoryNumberOptionsService.getExternalNumberOptions('+123').then(response => {
        expect(response).toEqual(this.externalNumbers);
      });
      this.$httpBackend.flush();
    });

    it('should get external numbers list and default to query for unassigned numbers sorted by pattern', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/externalnumberpools?directorynumber=&externalnumbertype=Fixed+Line+or+Mobile&order=pattern')
        .respond(200, this.externalNumbersResponse);
      this.DirectoryNumberOptionsService.getExternalNumberOptions(Pattern.SKIP_MATCHING, Availability.UNASSIGNED).then(response => {
        expect(response).toEqual(this.externalNumbers);
      });
      this.$httpBackend.flush();
    });

    it('should get external numbers list and default to query for unassigned DID numbers sorted by pattern', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/externalnumberpools?directorynumber=&externalnumbertype=Fixed+Line+or+Mobile&order=pattern')
        .respond(200, this.externalNumbersResponse);
      this.DirectoryNumberOptionsService.getExternalNumberOptions(Pattern.SKIP_MATCHING, Availability.UNASSIGNED, ExternalNumberType.DID).then(response => {
        expect(response).toEqual(this.externalNumbers);
      });
      this.$httpBackend.flush();
    });

    it('should get external numbers list and default to query for unassigned toll free numbers sorted by pattern', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/externalnumberpools?directorynumber=&externalnumbertype=Toll+Free&order=pattern')
        .respond(200, this.externalNumbersResponse);
      this.DirectoryNumberOptionsService.getExternalNumberOptions(Pattern.SKIP_MATCHING, Availability.UNASSIGNED, ExternalNumberType.TOLLFREE).then(response => {
        expect(response).toEqual(this.externalNumbers);
      });
      this.$httpBackend.flush();
    });

    it('should get external numbers list and default to query for assigned and unassigned toll free numbers sorted by pattern', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/externalnumberpools?directorynumber=&externalnumbertype=Toll+Free&order=pattern')
        .respond(200, this.externalNumbersResponse);
      this.DirectoryNumberOptionsService.getExternalNumberOptions(Pattern.SKIP_MATCHING, Availability.ASSIGNED_AND_UNASSIGNED, ExternalNumberType.TOLLFREE).then(response => {
        expect(response).toEqual(this.externalNumbers);
      });
      this.$httpBackend.flush();
    });

    it('should get external numbers list and default to query for assigned and unassigned DID numbers sorted by pattern', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/externalnumberpools?directorynumber=&externalnumbertype=Fixed+Line+or+Mobile&order=pattern')
        .respond(200, this.externalNumbersResponse);
      this.DirectoryNumberOptionsService.getExternalNumberOptions(Pattern.SKIP_MATCHING, Availability.ASSIGNED_AND_UNASSIGNED, ExternalNumberType.DID).then(response => {
        expect(response).toEqual(this.externalNumbers);
      });
      this.$httpBackend.flush();
    });
  });

  describe('getInternalNumbers function with toggles', function () {
    beforeEach(function () {
      this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(true));
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers?assigned=false&deprecated=false&type=internal')
        .respond(200);
    });
    it('should get internal numbers list with LocationId when locationId is passed when featureToggle is ON', function () {
      this.DirectoryNumberOptionsService.getInternalNumberOptions(undefined, undefined, this.locationId).then(() => {
        expect(this.NumberService.getNumberList).not.toHaveBeenCalledWith();
      });
      this.$httpBackend.flush();
    });
  });

});
