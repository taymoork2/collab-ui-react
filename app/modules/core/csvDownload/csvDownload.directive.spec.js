'use strict';

describe('Directive: csvDownload', function () {
  var $compile, $rootScope, $scope, $timeout, $httpBackend;

  beforeEach(module('wx2AdminWebClientApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, _$httpBackend_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
    $httpBackend.when('GET', 'https://atlas-integration.wbx2.com/admin/api/v1/csv/organizations/null/users/template').respond({});
  }));

  it('should replace the element with the appropriate content', function () {
    var element = $compile('<csv-download type="template" filename="template.csv"></csv-download>')($scope);
    $scope.$digest();

    var isolated = element.isolateScope();
    expect(isolated.downloading).toBeFalsy();
    expect(isolated.downloadingMessage).toBe('');
    expect(element.html()).toContain("csv-download");
    expect(element.html()).toContain("icon-circle-download");
  });

  it('should replace the icon when attribute icon is present', function () {
    var element = $compile('<csv-download type="template" filename="template.csv" icon="abc-icon"></csv-download>')($scope);
    $scope.$digest();

    expect(element.html()).toContain("abc-icon");
  });

  it('should remove the icon class icon-circle-download when no-icon is present', function () {
    var element = $compile('<csv-download type="any" filename="some.csv" no-icon></csv-download>')($scope);
    $scope.$digest();

    expect(element.html()).not.toContain("icon-circle-download");
  });

  it('should download template by clicking the anchor', function () {
    var element = $compile('<csv-download type="template" filename="template.csv"></csv-download>')($scope);
    $scope.$digest();

    var downloadAnchor = element.find('a');
    downloadAnchor[0].click();
    var isolated = element.isolateScope();
    expect(isolated.downloading).toBeTruthy();
    expect(isolated.downloadingMessage).toContain('csvDownload.csvDownloadInProgress');
    // start download
    $timeout.flush(300);
    expect(downloadAnchor.attr('disabled')).toBe('disabled');
    $httpBackend.flush();
    // finish download - changeAnchorAttrToDownloadState
    $timeout.flush(300);
    expect(downloadAnchor.attr('href')).toContain('blob');
    expect(downloadAnchor.attr('download')).toBe('template.csv');
    expect(downloadAnchor.attr('disabled')).toBe(undefined);
    // finish download - click
    $timeout.flush(300);
    expect(isolated.downloading).toBeFalsy();
  });

});
