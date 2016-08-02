/**
 * 
 */
'use strict';

describe('WebExCsvDownloadService.webexCreateObjectUrl() test', function () {
  var WebExCsvDownloadService;
  var WebExUtilsFact;

  var $rootScope;

  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function (
    _$rootScope_,
    _WebExCsvDownloadService_,
    _WebExUtilsFact_
  ) {

    $rootScope = _$rootScope_;

    WebExCsvDownloadService = _WebExCsvDownloadService_;
    WebExUtilsFact = _WebExUtilsFact_;

    spyOn(WebExUtilsFact, 'utf8ToUtf16le').and.returnValue("");
    spyOn(WebExCsvDownloadService, 'getNewBlob').and.returnValue(null);
    spyOn(WebExCsvDownloadService, 'isWindowsIE').and.returnValue(false);
    spyOn(WebExCsvDownloadService, 'windowsIEDownload').and.returnValue(null);
  }));

  it('can handle non-windowsIE browser call', function () {
    WebExCsvDownloadService.webexCreateObjectUrl({}, "");

    expect(WebExUtilsFact.utf8ToUtf16le).toHaveBeenCalled();
    expect(WebExCsvDownloadService.getNewBlob).toHaveBeenCalled();
    expect(WebExCsvDownloadService.isWindowsIE).toHaveBeenCalled();
    expect(WebExCsvDownloadService.windowsIEDownload).not.toHaveBeenCalled();
  }); // it()
}); // describe()

describe('WebExCsvDownloadService.webexCreateObjectUrl() test2', function () {
  var WebExCsvDownloadService;
  var WebExUtilsFact;

  var $rootScope;

  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function (
    _$rootScope_,
    _WebExCsvDownloadService_,
    _WebExUtilsFact_
  ) {

    $rootScope = _$rootScope_;

    WebExCsvDownloadService = _WebExCsvDownloadService_;
    WebExUtilsFact = _WebExUtilsFact_;

    spyOn(WebExUtilsFact, 'utf8ToUtf16le').and.returnValue("");
    spyOn(WebExCsvDownloadService, 'getNewBlob').and.returnValue(null);
    spyOn(WebExCsvDownloadService, 'isWindowsIE').and.returnValue(true);
    spyOn(WebExCsvDownloadService, 'windowsIEDownload').and.returnValue(null);
  }));

  it('can handle windowsIE browser call', function () {
    WebExCsvDownloadService.webexCreateObjectUrl({}, "");

    expect(WebExUtilsFact.utf8ToUtf16le).toHaveBeenCalled();
    expect(WebExCsvDownloadService.getNewBlob).toHaveBeenCalled();
    expect(WebExCsvDownloadService.isWindowsIE).toHaveBeenCalled();
    expect(WebExCsvDownloadService.windowsIEDownload).toHaveBeenCalled();
  }); // it()
}); // describe()
