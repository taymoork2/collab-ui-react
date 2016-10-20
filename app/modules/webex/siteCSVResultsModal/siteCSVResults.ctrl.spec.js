'use strict';

describe('SiteCSVResultsCtr: export results', function () {
  beforeEach(angular.mock.module('WebExApp'));

  var $controller;
  var $rootScope;

  var SiteCSVResultsCtrl;

  beforeEach(inject(function (
    _$controller_,
    _$rootScope_
  ) {

    $controller = _$controller_;
    $rootScope = _$rootScope_;

    var fakeSiteRow = {
      license: {
        siteUrl: "fake.webex.com"
      },

      csvStatusObj: {
        "siteUrl": "fake.webex.com",
        "isMockResult": false,
        "status": "exportCompletedNoErr",
        "details": {
          "jobType": 2,
          "request": 2,
          "errorLogLink": null,
          "created": "05/05/16 04:33 AM",
          "started": "05/05/16 04:34 AM",
          "finished": "05/05/16 04:39 AM",
          "totalRecords": 25,
          "successRecords": 25,
          "failedRecords": 0,
          "exportFileLink": "exportFileID"
        }
      },
    };

    SiteCSVResultsCtrl = $controller('SiteCSVResultsCtrl', {
      $stateParams: {
        siteRow: fakeSiteRow
      }
    });
  })); // beforeEach(inject())

  it('should initialize the SiteCSVResultsCtrl object for export results', function () {
    $rootScope.$apply();

    // alert("SiteCSVResultsCtrl=" + JSON.stringify(SiteCSVResultsCtrl));

    expect(SiteCSVResultsCtrl).not.toBe(null);
    expect(SiteCSVResultsCtrl.viewReady).not.toBe(null);
    expect(SiteCSVResultsCtrl.siteRow).not.toBe(null);
    expect(SiteCSVResultsCtrl.csvStatusObj).not.toBe(null);
    expect(SiteCSVResultsCtrl.gridRows).not.toBe(null);
    expect(SiteCSVResultsCtrl.gridRows.length).toEqual(4);
    expect(SiteCSVResultsCtrl.downloadFileUrl).toEqual("https://fake.webex.com/meetingsapi/v1/files/exportFileID");
  }); // it()
}); // describe()

describe('SiteCSVResultsCtr: import results', function () {
  beforeEach(angular.mock.module('WebExApp'));

  var $controller;
  var $rootScope;

  var SiteCSVResultsCtrl;

  beforeEach(inject(function (
    _$controller_,
    _$rootScope_
  ) {

    $controller = _$controller_;
    $rootScope = _$rootScope_;

    var fakeSiteRow = {
      "license": {
        siteUrl: "fake.webex.com"
      },
      "csvStatusObj": {
        siteUrl: "fake.webex.com",
        "isMockResult": false,
        "status": "importCompletedWithErr",
        "details": {
          "jobType": 1,
          "request": 2,
          "errorLogLink": "importErrorFileID",
          "created": "05/19/16 06:35 PM",
          "started": "05/19/16 06:35 PM",
          "finished": "05/19/16 06:40 PM",
          "totalRecords": 14,
          "successRecords": 0,
          "failedRecords": 14,
          "importFileName": "NewSiteUsersU16LE.csv"
        }
      }
    };

    SiteCSVResultsCtrl = $controller('SiteCSVResultsCtrl', {
      $stateParams: {
        siteRow: fakeSiteRow
      }
    });
  })); // beforeEach(inject())

  it('should initialize the SiteCSVResultsCtrl object for import results', function () {
    $rootScope.$apply();

    // alert("SiteCSVResultsCtrl=" + JSON.stringify(SiteCSVResultsCtrl));

    expect(SiteCSVResultsCtrl).not.toBe(null);
    expect(SiteCSVResultsCtrl.viewReady).not.toBe(null);
    expect(SiteCSVResultsCtrl.siteRow).not.toBe(null);
    expect(SiteCSVResultsCtrl.csvStatusObj).not.toBe(null);
    expect(SiteCSVResultsCtrl.gridRows).not.toBe(null);
    expect(SiteCSVResultsCtrl.gridRows.length).toEqual(4);
    expect(SiteCSVResultsCtrl.downloadFileUrl).toEqual("https://fake.webex.com/meetingsapi/v1/files/importErrorFileID");
  }); // it()
}); // describe()
