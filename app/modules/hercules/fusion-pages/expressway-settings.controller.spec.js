'use strict';

describe('Controller: ExpresswayClusterSettingsController', function () {
  beforeEach(angular.mock.module('Hercules'));
  var $scope;
  var view;
  var html;
  var $compile;

  beforeEach(inject(function ($rootScope, $templateCache, _$compile_, $q, FusionClusterService) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    html = $templateCache.get('modules/hercules/fusion-pages/expressway-settings.html');
    $scope.clusterSettings = {
      deactivateService: sinon.stub(),
      enabledServices: ['c_cal', 'c_ucmc', 'c_mgmt']
    };
    // This view will load the <upgrade-schedule-configuration> component which will trigger
    // an HTTP request for nothing. The line below blocks it.
    spyOn(FusionClusterService, 'getUpgradeSchedule').and.returnValue($q.reject({}));
    view = $compile(angular.element(html))($scope);
    $scope.$digest();
  }));

  xit('should remove a deactivate service button once a service is deactivated', function () {

    // First verify that the "Deactivate Calendar" button is there when 'c_cal' is provisioned …
    view.find('#deactivateCalendar').click();
    expect(view.find('#deactivateCalendar').length).toBe(1);
    // … then de-provision 'c_cal' …
    $scope.clusterSettings.enabledServices = ['c_ucmc', 'c_mgmt'];
    view = $compile(angular.element(html))($scope);
    $scope.$digest();
    // … and verify that the "Deactivate Calendar" button is *not* there anymore.
    view.find('#deactivateCalendar').click();
    expect(view.find('#deactivateCalendar').length).toBe(0);

  });
});
