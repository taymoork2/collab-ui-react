describe('DashboardHeaderDirective', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var $compile, $rootScope, popoverScope, element;
  beforeEach(inject(function($injector, _$compile_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $injector.get('$httpBackend').when('GET', 'l10n/en_US.json').respond({});

    var body = angular.element(
      "<div>" +
      "  <div class=\"popover\" hercules-popover>" +
      "    <a class=\"popover-trigger\">qux</a>" +
      "    <span class=\"popover-title\">bar</span>" +
      "    <span class=\"popover-content\">foo</span>" +
      "  </div>" +
      "  <div class=\"target\"></div>" +
      "</div>"
    );

    element = $compile(body)($rootScope);
    $rootScope.$digest();
  }));

  it('replaces the element with the appropriate content', function() {
    // todo: not really sure how to test this properly
    expect(element.popover().html()).toContain("popover-title");
  });

  it('should get title', function() {
    expect($rootScope.getTitle()).toBe("bar");
  });

  it('should get content', function() {
    expect($rootScope.getContent()).toBe("foo");
  });

});
