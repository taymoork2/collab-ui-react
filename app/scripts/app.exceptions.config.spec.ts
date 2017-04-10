describe('$exceptionHandler', function () {
  beforeEach(function () {
    this.initModules('wx2AdminWebClientApp');
    angular.mock.module('Core');
    angular.mock.module('Huron');
    angular.mock.module(($provide, $exceptionHandlerProvider) => {
      $provide.value('BadService', {
        badFunction: () => {
          throw Error('bad problem');
        },
      });
      $exceptionHandlerProvider.mode('log');
    });

    this.injectDependencies('$httpBackend', '$scope', 'Analytics', 'BadService');
    this.$httpBackend.whenGET('l10n/en_US.json').respond(200);
    spyOn(this.Analytics, 'trackError');
  });

  it('should invoke handler on uncaught errors', function () {
    this.$scope.$apply(() => {
      this.BadService.badFunction();
    });

    expect(this.Analytics.trackError).toHaveBeenCalled();
    expect(this.Analytics.trackError.calls.mostRecent().args[0].message).toEqual('bad problem');
  });
});
