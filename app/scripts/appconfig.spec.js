'use strict';

describe('App Config', function () {
  var $scope, $compile, $httpBackend;

  beforeEach(angular.mock.module('wx2AdminWebClientApp'));

  beforeEach(inject(function ($rootScope, _$compile_, _$httpBackend_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    //hack the l10n json because entire module is loaded
    $httpBackend.whenGET('l10n/en_US.json').respond(200);
  }));

  describe('$compile', function () {

    function getCompiledLink(url) {
      $scope.myUrl = url;
      var template = angular.element('<a ng-href="{{myUrl}}"></a>');
      var element = $compile(template)($scope);
      $scope.$apply();
      return element[0].href;
    }

    it('should compile http href', function () {
      expect(getCompiledLink('http:stuff')).not.toContain('unsafe');
    });

    it('should compile https href', function () {
      expect(getCompiledLink('https:stuff')).not.toContain('unsafe');
    });

    it('should compile ftp href', function () {
      expect(getCompiledLink('ftp:stuff')).not.toContain('unsafe');
    });

    it('should compile mailto href', function () {
      expect(getCompiledLink('mailto:stuff')).not.toContain('unsafe');
    });

    it('should compile tel href', function () {
      expect(getCompiledLink('tel:stuff')).not.toContain('unsafe');
    });

    it('should compile file href', function () {
      expect(getCompiledLink('file:stuff')).not.toContain('unsafe');
    });

    it('should compile blob href', function () {
      expect(getCompiledLink('blob:stuff')).not.toContain('unsafe');
    });

    it('should not compile custom href', function () {
      expect(getCompiledLink('custom:stuff')).toContain('unsafe');
    });

  });
});
