describe('Component: pgNumber setup', () => {

  let successResponse = [{
    extension: '2222',
    extensionUUID: '22a2dc30-041f-4d25-9351-325eb1db7f79',
  }];

  beforeEach(function () {
    this.initModules('huron.paging-group.number');
    this.injectDependencies(
      '$httpBackend',
      'Notification',
      '$q',
      'Authinfo',
      'HuronConfig',
      'PagingNumberService',
    );
    this.compileComponent('pgNumber', {
      pagingGroupNumber: 'pagingGroupNumber',
      onUpdate: 'onUpdate(number, isValid)',
    });
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    this.getNumberListDefer = this.$q.defer();
    spyOn(this.PagingNumberService, 'getNumberSuggestions').and.returnValue(this.getNumberListDefer.promise);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should select a number', function () {
    let numberData = {
      extension: '2222',
      extensionUUID: '22a2dc30-041f-4d25-9351-325eb1db7f79',
    };
    this.controller.selectNumber(numberData);
    expect(this.controller.pagingGroupNumber).toEqual(numberData);
  });

  it('fetch number success', function () {
    let numberData = {
      extension: '2222',
      extensionUUID: '22a2dc30-041f-4d25-9351-325eb1db7f79',
    };

    this.getNumberListDefer.resolve(successResponse);
    this.controller.queryString = '222';

    this.controller.fetchNumbers().then(
      (data) => {
        expect(data).toEqual([ numberData ]);
      }, (response) => {
      expect(this.Notification.errorResponse).toHaveBeenCalledWith(response, 'pagingGroup.numberFetchFailure');
    });
  });

  it('fetch number failure', function () {
    this.getNumberListDefer.reject();
    this.controller.queryString = '222';
    this.controller.fetchNumbers().then(
      (data) => {
        expect(data).toEqual([]);
      });
  });

});
