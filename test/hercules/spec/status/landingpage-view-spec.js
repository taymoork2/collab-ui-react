describe('LandingPageView', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $compile, $rootScope, $templateCache;
  beforeEach(inject(function ($injector, _$compile_, _$rootScope_, _$templateCache_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $templateCache = _$templateCache_;
  }));

  it('contains the hercules status directive', function () {
    // not optimal. should test the controller and not just the view...
    var html = $templateCache.get('modules/core/landingPage/landingPage.tpl.html');
    var view = $compile(angular.element(html))($rootScope);
    expect(view.html()).toContain("hercules-status");
  });
});
