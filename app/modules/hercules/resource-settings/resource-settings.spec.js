'use strict';

describe('ResourceSettings', function () {
  beforeEach(module('Hercules'));
  var $scope;
  var view;
  var html;
  var compile;

  beforeEach(inject(function ($rootScope, $templateCache, $compile) {
    $scope = $rootScope.$new();
    html = $templateCache.get("modules/hercules/resource-settings/resource-settings.html");
    $scope.resourceSetting = {
      deactivateService: sinon.stub(),
      enabledServices: ['c_cal', 'c_ucmc', 'c_mgmt']
    };
    compile = $compile;
    view = $compile(angular.element(html))($scope);
    $scope.$digest();
  }));

  fit('should remove a deactivate service button once a service is deactivated', function () {

    // First verify that the "Deactivate Calendar" button is there when 'c_cal' is provisioned …
    view.find('#deactivateCalendar').click();
    expect(view.find('#deactivateCalendar').length).toBe(1);
    // … then de-provision 'c_cal' …
    $scope.resourceSetting.enabledServices = ['c_ucmc', 'c_mgmt'];
    view = compile(angular.element(html))($scope);
    $scope.$digest();
    // … and verify that the "Deactivate Calendar" button is *not* there anymore.
    view.find('#deactivateCalendar').click();
    expect(view.find('#deactivateCalendar').length).toBe(0);

  });
});
