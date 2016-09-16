'use strict';

describe('Component: resourceGroupCard', function () {
  beforeEach(angular.mock.module('Hercules'));

  describe('Controller', function () {
    var $componentController;
    var controller;
    var mockGroup = {
      clusters: [],
      id: '1',
      name: 'Bøler',
      releaseChannel: 'stable'
    };

    beforeEach(inject(function ($injector) {
      $componentController = $injector.get('$componentController');
      controller = $componentController('resourceGroupCard', {
        $scope: {}
      }, {
        group: mockGroup
      });
    }));

    it('should bind to the correct group', function () {
      expect(controller.group.id).toEqual(mockGroup.id);
    });

    describe('showWarningText()', function () {
      it('should be true if there are 0 clusters', function () {
        expect(controller.showWarningText()).toEqual(true);
      });
    });
  });
});
