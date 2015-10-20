'use strict';

describe('Controller: ReportsCtrl', function () {

  var $controller, $scope, $stateParams,
    $state, WebexReportService, Authinfo, $translate, $sce;

  //beforeEach(module('wx2AdminWebClientApp'));

  beforeEach(module('WebExReports'));
  beforeEach(inject(function ($rootScope, _$controller_, _$stateParams_, _$state_, _$window_, _$q_) {
    //$scope = $rootScope.$new();
    $scope = {};
    $controller = _$controller_;
    $stateParams = {
      'siteUrl': 'go.webex.com'
    };

    WebexReportService = {

      'getReports': function () {
        var sections = {

        };
        var reports = {
          'getSections': function () {
            return sections;
          }
        };
        return reports;
      }, //getReports

      'initReportsObject': function () {
        var reportObject = {
          'siteUrl': 'go.webex.com'
        };
        return reportObject;
      }
    }; //WebexReportService

    Authinfo = {
      'getPrimaryEmail': function () {
        return "mojoco@webex.com";
      }
    };

    $sce = {
      'trustAsResourceUrl': function () {
        return "url";
      }
    };

    $translate = {
      'use': function () {
        return "en_US.json";
      }
    };

    spyOn(WebexReportService, 'getReports');
    spyOn(Authinfo, 'getPrimaryEmail').and.returnValue("mojoco@webex.com");

    var controller = $controller('WebExReportsCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      $translate: $translate,
      Authinfo: Authinfo,
      $sce: $sce,
      WebexReportService: WebexReportService
    });

    //$scope.$apply();
  }));

  // it('should call getReports in ReportsCtrl on WebexReportService', function () {
  //   expect(WebexReportService.getReports).toHaveBeenCalled();
  //   expect(true).toBe(true);
  // });
  it('scope should contain admin email', function () {
    expect($scope.adminEmailParam).toEqual("mojoco@webex.com");
  });
  it('scope should contain the site url', function () {
    expect($scope.siteUrl).toEqual("go.webex.com");
  });

});
