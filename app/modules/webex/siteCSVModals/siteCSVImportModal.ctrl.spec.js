'use strict';

describe('SiteCSVImportModalCtrl test', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  var $q;
  var $rootScope;
  var $controller;

  var Authinfo;
  var UrlConfig;
  var WebExApiGatewayService;
  var SiteListService;
  var SiteCSVImportModalCtrl;

  var fakeSiteRow;

  var deferredIsSiteSupportsIframe;
  var deferredCsvStatus;

  beforeEach(inject(function (
    _$q_,
    _$controller_,
    _$rootScope_,
    _Authinfo_,
    _UrlConfig_,
    _WebExApiGatewayService_,
    _SiteListService_
  ) {

    $q = _$q_;
    $rootScope = _$rootScope_;
    $controller = _$controller_;

    Authinfo = _Authinfo_;
    UrlConfig = _UrlConfig_;
    WebExApiGatewayService = _WebExApiGatewayService_;
    SiteListService = _SiteListService_;

    deferredIsSiteSupportsIframe = $q.defer();
    deferredCsvStatus = $q.defer();

    fakeSiteRow = {
      license: {
        siteUrl: "fake.webex.com"
      },

      csvStatusCheckMode: {
        isOn: true,
        checkStart: 0,
        checkEnd: 0,
        checkIndex: 0
      },

      csvPollIntervalObj: null
    };

    SiteCSVImportModalCtrl = $controller('SiteCSVImportModalCtrl', {
      $stateParams: {
        csvImportObj: fakeSiteRow
      }
    });

  })); // beforeEach(inject())

  it('should have valid import modal', function () {
    $rootScope.$apply();
    expect(SiteCSVImportModalCtrl.csvImportObj).not.toBe(null);
  });

}); // describe()
