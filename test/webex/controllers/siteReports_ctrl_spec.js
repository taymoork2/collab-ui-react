'use strict';

describe('Controller: ReportsCtrl', function () {

  var $controller, $scope, $stateParams,
    $state, reportService, AuthInfo, $translate, $sce;

  //beforeEach(module('wx2AdminWebClientApp'));

  beforeEach(module('WebExReports'));
  beforeEach(inject(function ($rootScope, _$controller_, _$stateParams_, _$state_, _$window_, _$q_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;

    reportService = {

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
    }; //reportService

    AuthInfo = {
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

    spyOn(reportService, 'getReports');

    var controller = $controller('ReportsCtrl', {
      $scope: $scope,
      $translate: $translate,
      AuthInfo: AuthInfo,
      $sce: $sce,
      reportService: reportService
    });

    $scope.$apply();
  }));

  it('should call getReports in ReportsCtrl on reportService', function () {
    expect(reportService.getReports).toHaveBeenCalled();
    expect(true).toBe(true);
  });
  // it('scope should contain admin email', function () {
  //   expect($scope.adminEmailParam).toEqual("mojoco@webex.com");
  // });

});
