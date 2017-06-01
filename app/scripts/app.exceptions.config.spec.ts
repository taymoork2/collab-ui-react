declare let newrelic;

describe('$exceptionHandler', function () {
  beforeEach(function () {
    newrelic = jasmine.createSpyObj('newrelic', ['noticeError', 'setCurrentRouteName']);
    this.initModules('wx2AdminWebClientApp');
    angular.mock.module(($provide, $exceptionHandlerProvider) => {
      $provide.value('BadService', {
        badFunction: () => {
          throw Error('bad problem');
        },
      });
      $exceptionHandlerProvider.mode('log');
    });

    this.injectDependencies('$httpBackend', '$scope', 'BadService');
    this.$httpBackend.whenGET('l10n/en_US.json').respond(200);
  });

  afterEach(function () {
    newrelic = undefined;
  });

  it('should invoke handler on uncaught errors', function () {
    this.$scope.$apply(() => {
      this.BadService.badFunction();
    });

    expect(newrelic.noticeError.calls.mostRecent().args[0].message).toBe('bad problem');
  });
});
