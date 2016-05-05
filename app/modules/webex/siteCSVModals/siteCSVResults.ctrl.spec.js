'use strict';

describe('SiteCSVResultsCtrl Test', function () {
  beforeEach(module('WebExApp'));

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
          "exportFileLink": "http://fake.webex.com/meetingsapi/v1/files/fakeFileID"
        }
      },
    };

    SiteCSVResultsCtrl = $controller('SiteCSVResultsCtrl', {
      $stateParams: {
        siteRow: fakeSiteRow
      }
    });
  })); // beforeEach(inject())

  it('should initialize the SiteCSVResultsCtrl object', function () {
    $rootScope.$apply();

    // alert("SiteCSVResultsCtrl=" + JSON.stringify(SiteCSVResultsCtrl));

    expect(SiteCSVResultsCtrl).not.toBe(null);
    expect(SiteCSVResultsCtrl.viewReady).not.toBe(null);
    expect(SiteCSVResultsCtrl.siteRow).not.toBe(null);
    expect(SiteCSVResultsCtrl.csvStatusObj).not.toBe(null);
    expect(SiteCSVResultsCtrl.gridRows).not.toBe(null);
  }); // it()
}); // describe()
