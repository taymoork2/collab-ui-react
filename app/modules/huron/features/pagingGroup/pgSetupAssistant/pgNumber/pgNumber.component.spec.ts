describe('Component: pgNumber setup', () => {

  let testNumber = {
    uuid: '22a2dc30-041f-4d25-9351-325eb1db7f79',
    number: '2222',
  };

  let successResponse = [{
    uuid: '22a2dc30-041f-4d25-9351-325eb1db7f79',
    pattern: '2222',
  }];

  beforeEach(function () {
    this.initModules('huron.paging-group.number');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'PagingNumberService'
    );
    this.compileComponent('pgNumber', {
      pagingGroupNumber: 'pagingGroupNumber',
      onUpdate: 'onUpdate(number, isValid)',
    });
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should select a number', function () {
    this.controller.selectNumber(testNumber);
    expect(this.controller.pagingGroupNumber).toEqual('2222');
  });

  it('fetch number success', function () {
    this.$httpBackend.whenGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/internalnumberpools?directorynumber=&order=pattern&pattern=%25222%25').respond(200, successResponse);
    this.controller.pagingGroupNumber = '222';
    this.controller.fetchNumbers();
    this.$httpBackend.flush();
    expect(this.controller.availableNumbers.length).toEqual(1);
  });

  it('fetch number failure', function () {
    this.$httpBackend.whenGET(this.HuronConfig.getCmiUrl() + '/voice/customers/' + this.Authinfo.getOrgId() + '/internalnumberpools?directorynumber=&order=pattern&pattern=%25222%25').respond(500);
    this.controller.pagingGroupNumber = '222';
    this.controller.fetchNumbers();
    this.$httpBackend.flush();
    expect(this.controller.availableNumbers.length).toEqual(0);
  });

});
