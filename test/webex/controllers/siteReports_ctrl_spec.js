'use strict';

describe('Controller: ReportsCtrl', function () {

  var controller, $scope, $stateParams, $state, reportService;

  beforeEach(module('wx2AdminWebClientApp'));

  beforeEach(inject(function ($rootScope, $controller, _$stateParams_, _$state_, _$window_, _$q_) {
    $scope = $rootScope.$new();

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
      }
    };

    //spyOn(reportService, 'getReports');

    controller = $controller('ReportsCtrl', {
      $scope: $scope,
      reportService: reportService
    });

    //$scope.$apply();
  }));

  //it('should call getReports in ReportsCtrl on reportService', function () {
  //expect(reportService.getReports).toHaveBeenCalled();
  //expect(true).toBe(true);
  //});

});
