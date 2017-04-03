import { INumberData } from 'modules/huron/features/pagingGroup/pagingGroup';

describe('Component: pgNumber service', () => {

  let successResponse1 = [
    {
      uuid: '22a2dc30-041f-4d25-9351-325eb1db7f79',
      pattern: '2222',
    },
    {
      uuid: '8e33e338-0caa-4579-86df-38ef7590f432',
      pattern: '3333',
    }];

  let successResponse2 = {
    number: '2222',
    uuid: '22a2dc30-041f-4d25-9351-325eb1db7f79',
  };

  let numberData = <INumberData> {
    extension: '2222',
    extensionUUID: '22a2dc30-041f-4d25-9351-325eb1db7f79',
  };

  beforeEach(function () {
    this.initModules('huron.paging-group.number');
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'PagingNumberService',
      'Authinfo',
      'HuronConfig',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    this.getNumberListDefer = this.$q.defer();
    spyOn(this.PagingNumberService, 'getNumberSuggestions').and.returnValue(this.getNumberListDefer.promise);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get a suggested number', function () {
    this.$httpBackend.whenGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/internalnumberpools?directorynumber=&order=pattern&pattern=%25222%25').respond(200, successResponse1);

    this.PagingNumberService.getNumberSuggestions('222').then(function (response) {
      let numberData2 = <INumberData> {
        extension: '3333',
        extensionUUID: '8e33e338-0caa-4579-86df-38ef7590f432',
      };
      expect(response).toEqual([numberData, numberData2]);
    });
  });

  it('should get the extension based on number uuid', function () {
    this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers/22a2dc30-041f-4d25-9351-325eb1db7f79').respond(200, successResponse2);
    this.PagingNumberService.getNumberExtension(numberData.extensionUUID).then(function (response) {
      expect(response).toEqual(numberData);
    });
    this.$httpBackend.flush();
  });
});
