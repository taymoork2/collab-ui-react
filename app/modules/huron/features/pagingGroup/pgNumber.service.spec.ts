describe('Component: pgNumber service', () => {

  let successResponse = [{
    uuid: '22a2dc30-041f-4d25-9351-325eb1db7f79',
    pattern: '2222',
  }];

  beforeEach(function () {
    this.initModules('huron.paging-group.number');
    this.injectDependencies(
      '$httpBackend',
      'PagingNumberService',
      'Authinfo',
      'HuronConfig'
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get a suggested number', function () {
    this.$httpBackend.whenGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/internalnumberpools?directorynumber=&order=pattern&pattern=%25222%25').respond(200, successResponse);
    this.PagingNumberService.getNumberSuggestions('222').then(function (response) {
      expect(response[0]).toEqual('2222');
    });
    this.$httpBackend.flush();
  });

});
