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
    numbers: [{
      number: '2222',
      uuid: '22a2dc30-041f-4d25-9351-325eb1db7f79',
      type: 'NUMBER_FORMAT_EXTENSION',
    }],
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
    let numberData3 = <INumberData> {
      extension: '2222',
      extensionUUID: undefined,
    };
    let groupId: string = 'abcd1234-abcd-abcd-abcddef123456';
    this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/paging/' + groupId + '/numbers').respond(200, successResponse2);
    this.PagingNumberService.getNumberExtension(groupId).then(function (response) {
      expect(response).toEqual(numberData3);
    });
    this.$httpBackend.flush();
  });
});
