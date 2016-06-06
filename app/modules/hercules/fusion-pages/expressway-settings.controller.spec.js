'use strict';

describe('Controller: ExpresswayClusterSettingsController', function () {
  beforeEach(module('Hercules'));
  var $scope;
  var view;
  var html;
  var compile;

  beforeEach(inject(function ($rootScope, $templateCache, $compile) {
    $scope = $rootScope.$new();
    html = $templateCache.get('modules/hercules/fusion-pages/expressway-settings.html');
    $scope.clusterSettings = {
      deactivateService: sinon.stub(),
      enabledServices: ['c_cal', 'c_ucmc', 'c_mgmt']
    };
    compile = $compile;
    view = $compile(angular.element(html))($scope);
    $scope.$digest();
  }));

  it('should remove a deactivate service button once a service is deactivated', function () {

    // First verify that the "Deactivate Calendar" button is there when 'c_cal' is provisioned …
    view.find('#deactivateCalendar').click();
    expect(view.find('#deactivateCalendar').length).toBe(1);
    // … then de-provision 'c_cal' …
    $scope.clusterSettings.enabledServices = ['c_ucmc', 'c_mgmt'];
    view = compile(angular.element(html))($scope);
    $scope.$digest();
    // … and verify that the "Deactivate Calendar" button is *not* there anymore.
    view.find('#deactivateCalendar').click();
    expect(view.find('#deactivateCalendar').length).toBe(0);

  });
});
