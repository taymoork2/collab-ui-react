'use strict';

describe('Controller: LineExportCtrl', function () {
  var controller, $controller, $q, $scope, $timeout, LineListService, Notification;

  var linesExport = getJSONFixture('huron/json/lines/numbersCsvExport.json');
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$q_, $rootScope, _$controller_, _$timeout_, _LineListService_, _Notification_) {
    $q = _$q_;
    $timeout = _$timeout_;
    $controller = _$controller_;
    $scope = $rootScope.$new();
    LineListService = _LineListService_;
    Notification = _Notification_;

    spyOn(Notification, 'errorResponse');
    spyOn(Notification, 'error');

    spyOn(LineListService, 'exportCSV').and.returnValue($q.when(linesExport));

    controller = $controller('LineExportCtrl', {
      $scope: $scope
    });

    $timeout.flush();
  }));

  describe('after initialization', function () {
    it('LineExportCtrl should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    it('should have intialized varables', function () {
      expect(controller.exportBusy).toBe(false);
      expect(controller.exportCSV).toBeDefined();
    });

  });

  describe('exportCSV', function () {
    it('should return promise with lines', function () {
      var promise = controller.exportCSV();
      promise
        .then(function (response) {
          expect(response.length).toBe(linesExport.length);
        });

    });

    it('should notify if promise rejected', function () {
      LineListService.exportCSV.calls.reset();
      LineListService.exportCSV.and.returnValue($q.reject());
      controller.exportCSV();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

  });

});
