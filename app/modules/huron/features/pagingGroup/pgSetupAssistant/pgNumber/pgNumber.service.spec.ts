describe('Component: pgNumber service', () => {

  let testNumber = {
    uuid: '22a2dc30-041f-4d25-9351-325eb1db7f79',
    directoryNumber: null,
    number: '2222',
    type: 'internal',
  };

  let successResponse = {
    numbers: [testNumber],
  };

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

  beforeEach(installPromiseMatchers);

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get a suggested number', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers?assigned=false&number=222').respond(200, successResponse);
    this.PagingNumberService.getNumberSuggestions('222').then(function (data) {
      expect(data.numbers[0].number).toEqual('2222');
    });
    this.$httpBackend.flush();
  });

});
