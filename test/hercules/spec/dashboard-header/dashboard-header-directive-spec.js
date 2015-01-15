describe('DashboardHeaderDirective', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var $compile, $rootScope;
  beforeEach(inject(function($injector, _$compile_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $injector.get('$httpBackend').when('GET', 'l10n/en_US.json').respond({});
  }));

  it('replaces the element with the appropriate content', function() {
    var element = $compile("<hercules-dashboard-header/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("dashboard-header");
  });
});
