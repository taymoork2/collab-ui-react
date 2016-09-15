import { IDirectoryNumber } from './index';

describe('Service: DirectoryNumberOptionsService', () => {
  beforeEach(function () {
    this.initModules('huron.directory-number');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'DirectoryNumberOptionsService'
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    let internalNumbersResponse: IDirectoryNumber[] = [
      {pattern: '12345'},
      {pattern: '67890'},
      {pattern: '75023'},
    ];

    let internalNumbers: string[] = [
      '12345',
      '67890',
      '75023'
    ];

    let externalNumbersResponse: IDirectoryNumber[] = [
      {pattern: '+12345'},
      {pattern: '+67890'},
    ];

    let externalNumbers: string[] = [
      '+12345',
      '+67890'
    ];

    this.internalNumbers = internalNumbers;
    this.externalNumbers = externalNumbers;
    this.internalNumbersResponse = internalNumbersResponse;
    this.externalNumbersResponse = externalNumbersResponse;
  });
  beforeEach(installPromiseMatchers);

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get internal numbers list', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/internalnumberpools?directorynumber=&order=pattern')
      .respond(200, this.internalNumbersResponse);
    this.DirectoryNumberOptionsService.getInternalNumberOptions().then(response => {
      expect(response).toEqual(this.internalNumbers);
    })
    this.$httpBackend.flush();
  });

  it('should reject the promise on a failed response', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/internalnumberpools?directorynumber=&order=pattern').respond(500);
    let promise = this.DirectoryNumberOptionsService.getInternalNumberOptions();
    this.$httpBackend.flush();
    expect(promise).toBeRejected();
  });

  it('should get external numbers list', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/externalnumberpools?directorynumber=&order=pattern')
      .respond(200, this.externalNumbersResponse);
    this.DirectoryNumberOptionsService.getExternalNumberOptions().then(response => {
      expect(response).toEqual(this.externalNumbers);
    })
    this.$httpBackend.flush();
  });

  it('should reject the promise on a failed response', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/externalnumberpools?directorynumber=&order=pattern').respond(500);
    let promise = this.DirectoryNumberOptionsService.getExternalNumberOptions();
    this.$httpBackend.flush();
    expect(promise).toBeRejected();
  });

});