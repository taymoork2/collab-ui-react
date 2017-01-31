import digitalRiverModule from './index';

describe('Component: digitalRiverIframe', () => {
  beforeEach(function () {
    this.initModules(digitalRiverModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      '$scope',
      'DigitalRiverService',
    );
    this.logoutDefer = this.$q.defer();
    spyOn(this.DigitalRiverService, 'logout').and.returnValue(this.logoutDefer.promise);

    this.$scope.iframeSrc = 'https://some.iframe.src';
    this.compileComponentWithParams = (params?: Object): void => {
      this.compileComponent('digitalRiverIframe', _.assign({
        iframeSrc: 'iframeSrc',
      }, params));
    };
  });

  const IFRAME = 'iframe';
  const LOADING_SPINNER = '.loading-wrapper';

  it('should logout and then load requested iframe', function () {
    this.compileComponentWithParams();

    expect(this.controller.iframeLoading).toBe(true);
    expect(this.view.find(IFRAME)).not.toHaveAttr('src');
    expect(this.view.find(LOADING_SPINNER)).toExist();

    this.logoutDefer.resolve();
    this.$scope.$apply();

    expect(this.controller.iframeLoading).toBe(true);
    expect(this.view.find(IFRAME)).toHaveAttr('src', 'https://some.iframe.src');
    expect(this.view.find(LOADING_SPINNER)).toExist();

    this.view.find(IFRAME).trigger('load');

    expect(this.controller.iframeLoading).toBe(false);
    expect(this.view.find(LOADING_SPINNER)).not.toExist();
  });

  it('should drop the loading spinner based on the specified loading flag', function () {
    this.$scope.loading = true;
    this.compileComponentWithParams({
      iframeLoading: 'loading',
    });

    expect(this.controller.iframeLoading).toBe(true);
    expect(this.view.find(IFRAME)).not.toHaveAttr('src');
    expect(this.view.find(LOADING_SPINNER)).toExist();

    this.$scope.loading = false;
    this.$scope.$digest();

    expect(this.controller.iframeLoading).toBe(false);
    expect(this.view.find(IFRAME)).not.toHaveAttr('src');
    expect(this.view.find(LOADING_SPINNER)).not.toExist();
  });
});
