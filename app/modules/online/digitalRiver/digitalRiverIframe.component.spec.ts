import digitalRiverModule from './index';

describe('Component: digitalRiverIframe', () => {
  beforeEach(function () {
    this.initModules(digitalRiverModule);
    this.injectDependencies(
      '$httpBackend',
      '$scope',
      'DigitalRiverService'
    );
    this.$scope.iframeSrc = 'https://some.iframe.src';
    this.compileComponentWithParams = (params?: Object): void => {
      this.compileComponent('digitalRiverIframe', _.assign({
        iframeSrc: 'iframeSrc',
      }, params));
    };
  });

  const IFRAME = 'iframe';
  const LOADING_SPINNER = '.loading-wrapper';

  it('should load logout iframe followed by requested iframe', function () {
    this.compileComponentWithParams();

    expect(this.controller.logoutLoading).toBe(true);
    expect(this.controller.iframeLoading).toBe(true);
    expect(this.view.find(IFRAME)).toHaveAttr('src', this.DigitalRiverService.getLogoutUrl());
    expect(this.view.find(LOADING_SPINNER)).toExist();

    this.view.find(IFRAME).trigger('load');

    expect(this.controller.logoutLoading).toBe(false);
    expect(this.controller.iframeLoading).toBe(true);
    expect(this.view.find(IFRAME)).toHaveAttr('src', 'https://some.iframe.src');
    expect(this.view.find(LOADING_SPINNER)).toExist();

    this.view.find(IFRAME).trigger('load');

    expect(this.controller.logoutLoading).toBe(false);
    expect(this.controller.iframeLoading).toBe(false);
    expect(this.view.find(LOADING_SPINNER)).not.toExist();
  });

  it('should load logout frame with specified loading flag', function () {
    this.$scope.loading = true;
    this.compileComponentWithParams({
      iframeLoading: 'loading',
    });

    expect(this.controller.logoutLoading).toBe(true);
    expect(this.controller.iframeLoading).toBe(true);
    expect(this.view.find(IFRAME)).toHaveAttr('src', this.DigitalRiverService.getLogoutUrl());
    expect(this.view.find(LOADING_SPINNER)).toExist();

    this.$scope.loading = false;
    this.$scope.$digest();

    expect(this.controller.logoutLoading).toBe(true);
    expect(this.controller.iframeLoading).toBe(false);
    expect(this.view.find(IFRAME)).toHaveAttr('src', this.DigitalRiverService.getLogoutUrl());
    expect(this.view.find(LOADING_SPINNER)).not.toExist();
  });
});
