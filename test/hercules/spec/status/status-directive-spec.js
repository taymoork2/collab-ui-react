describe('StatusDirective', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var $compile, $rootScope;
  beforeEach(inject(function($injector, _$compile_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    httpBackend = $injector.get('$httpBackend');
    httpBackend.when('GET', 'l10n/en_US.json').respond({});
    httpBackend.when('GET', 'https://hercules-integration.wbx2.com/v1/clusters').respond({});
  }));

  it('replaces the element with the appropriate content', function() {
    var element = $compile("<hercules-status/>")($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain("hercules-status");
  });
});
