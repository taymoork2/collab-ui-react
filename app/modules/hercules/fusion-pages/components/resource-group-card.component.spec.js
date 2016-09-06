'use strict';

describe('Component: resourceGroupCard', function () {
  beforeEach(angular.mock.module('Hercules'));

  describe('Controller', function () {
    var $componentController;
    var controller;
    // TODO: improve the mock…
    var mockGroups = {
      groups: [],
      unassigned: []
    };

    beforeEach(inject(function ($injector) {
      $componentController = $injector.get('$componentController');
      controller = $componentController('resourceGroupCard', {
        $scope: {}
      }, {
        group: mockGroups
      });
    }));

    it('should bind to the correct group', function () {
      expect(controller.group.unassigned.length).toEqual(mockGroups.unassigned.length);
    });
  });
});
