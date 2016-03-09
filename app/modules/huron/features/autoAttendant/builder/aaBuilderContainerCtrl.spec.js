'use strict';

describe('Controller: AABuilderContainerCtrl', function () {
  var $scope, controller, AAModelService, AutoAttendantCeInfoModelService, AAUiModelService;

  var uiModel = {
    isClosedHours: false,
    isHolidays: false
  };
  var aaModel = {
    aaRecord: {
      scheduleId: undefined
    }
  };

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($controller, _$rootScope_, _AAModelService_, _AAUiModelService_) {
    $scope = _$rootScope_;

    AAUiModelService = _AAUiModelService_;
    AAModelService = _AAModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(uiModel);
    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

    controller = $controller('AABuilderContainerCtrl', {
      $scope: $scope
    });

  }));

  describe('getScheduleTitle', function () {

    it('should receive the schedule all day message', function () {

      var title = controller.getScheduleTitle();

      expect(title).toEqual('autoAttendant.scheduleAllDay');

    });

    it('should receive the generic schedule when isClosedHours is false', function () {

      uiModel.isClosedHours = false;
      uiModel.isHolidays = true;

      var title = controller.getScheduleTitle();

      expect(title).toEqual('autoAttendant.schedule');

    });

    it('should receive the generic schedule when isHolidays is false', function () {
      uiModel.isClosedHours = true;
      uiModel.isHolidays = false;

      var title = controller.getScheduleTitle();

      expect(title).toEqual('autoAttendant.schedule');

    });

    it('should receive the schedule all day message when both are true', function () {
      uiModel.isClosedHours = true;
      uiModel.isHolidays = true;

      var title = controller.getScheduleTitle();

      expect(title).toEqual('autoAttendant.schedule');

    });
  });
});

describe('Controller: AABuilderContainerCtrl with scheduleId', function () {
  var $scope, controller, AAModelService, AAUiModelService;

  var uiModel = {
    isClosedHours: false,
    isHolidays: false
  };

  var aaModel = {
    aaRecord: {
      scheduleId: "1"
    }
  };

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($controller, _$rootScope_, _AAModelService_, _AAUiModelService_) {
    $scope = _$rootScope_;

    AAUiModelService = _AAUiModelService_;
    AAModelService = _AAModelService_;

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(uiModel);
    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

    controller = $controller('AABuilderContainerCtrl', {
      $scope: $scope
    });

  }));

  describe('getScheduleTitle', function () {

    it('should receive the generic schedule', function () {

      var title = controller.getScheduleTitle();

      expect(title).toEqual('autoAttendant.schedule');
      expect(uiModel.isClosedHours).toEqual(true);

    });

    it('should receive the generic schedule when isClosedHours is false', function () {

      uiModel.isClosedHours = false;
      uiModel.isHolidays = true;

      var title = controller.getScheduleTitle();

      expect(title).toEqual('autoAttendant.schedule');

    });

    it('should receive the generic schedule when isHolidays is false', function () {
      uiModel.isClosedHours = true;
      uiModel.isHolidays = false;

      var title = controller.getScheduleTitle();

      expect(title).toEqual('autoAttendant.schedule');

    });

    it('should receive the generic schedule message when both are true', function () {
      uiModel.isClosedHours = true;
      uiModel.isHolidays = true;

      var title = controller.getScheduleTitle();

      expect(title).toEqual('autoAttendant.schedule');

    });

    it('should receive the schedule all day message when both are false', function () {
      uiModel.isClosedHours = false;
      uiModel.isHolidays = false;

      var title = controller.getScheduleTitle();

      expect(title).toEqual('autoAttendant.scheduleAllDay');

    });
  });
});
