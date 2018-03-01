describe('$exceptionHandler', function () {
  beforeEach(function () {
    this.initModules('wx2AdminWebClientApp');
    angular.mock.module(($provide, $exceptionHandlerProvider) => {
      $provide.value('BadService', {
        badFunction: () => {
          throw Error('bad problem');
        },
      });
      $exceptionHandlerProvider.mode('log');
    });

    this.injectDependencies(
      '$exceptionHandler',
      '$httpBackend',
      '$scope',
      'BadService',
    );
    this.$httpBackend.whenGET('l10n/en_US.json').respond(200);
  });

  it('should invoke handler on uncaught errors', function () {
    this.$scope.$apply(() => {
      this.BadService.badFunction();
    });

    expect(this.$exceptionHandler.errors[0][0].message).toBe('bad problem');
  });
});
