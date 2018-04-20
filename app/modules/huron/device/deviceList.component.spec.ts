describe('deviceList component', () => {
  let $scope, $componentController;

  beforeEach(angular.mock.module('Core'));

  beforeEach(inject((
    $rootScope,
    _$componentController_,
  ) => {
    $scope = $rootScope.$new();
    $componentController = _$componentController_;
  }));

  const initController = () => {
    return $componentController('ucDeviceList', {}, null);
  };

  describe('showCorrectElements function', () => {
    describe('showGenerateButton', () => {
      it('should show generate button when no devices', () => {
        const controller = initController();
        const deviceList = [];
        controller.showCorrectElements(deviceList);

        expect(controller.showGenerateButton).toBe(true);
      });

      it('should hide generate button when there are devices', () => {
        const controller = initController();
        const deviceList = [{}];
        controller.showCorrectElements(deviceList);

        expect(controller.showGenerateButton).toBe(false);
      });
    });

    describe('showActions', () => {
      it('should hide actions when there are no devices', () => {
        const controller = initController();
        const deviceList = [];
        controller.showCorrectElements(deviceList);

        expect(controller.showActions).toBe(false);
      });

      it('should show actions when there are devices and owner is a user', () => {
        const controller = initController();
        const deviceList = [{}];
        controller.ownerType = 'user';
        controller.showCorrectElements(deviceList);

        expect(controller.showActions).toBe(true);
      });

      it('should show actions when there are devices and place is huron type', () => {
        const controller = initController();
        const deviceList = [{}];
        controller.placeType = 'huron';
        controller.showCorrectElements(deviceList);

        expect(controller.showActions).toBe(true);
      });

      it('should show actions when there are devices and multiple cloudberry devices are allowed', () => {
        const controller = initController();
        $scope.$apply();
        const deviceList = [{}];
        controller.placeType = 'huron';
        controller.showCorrectElements(deviceList);

        expect(controller.showActions).toBe(true);
      });
    });

    describe('showMultipleDeviceWarning', () => {
      it('should show multiple device warning when owner is a cloudberry place, list has more than one device, which are not exactly one Spark Voice and one Spark Share', () => {
        const controller = initController();
        const deviceList = [
          {
            product: 'Cisco Spark Voice',
          },
          {
            product: 'Cisco Spark Share',
          },
          {
            product: 'Cisco Spark Pizza',
          },
        ];
        controller.ownerType = 'place';
        controller.placeType = 'cloudberry';
        controller.showCorrectElements(deviceList);

        expect(controller.showMultipleDeviceWarning).toBe(true);
      });
    });

    it('should not show multiple device warning when owner is not a cloudberry place', () => {
      const controller = initController();
      const deviceList = [
        {
          product: 'Cisco Spark SomethingNotVoice',
        },
        {
          product: 'Cisco Spark Share',
        },
      ];
      controller.ownerType = 'place';
      controller.placeType = 'huron';
      controller.showCorrectElements(deviceList);

      expect(controller.showMultipleDeviceWarning).toBe(false);
    });

    it('should not show multiple device warning when list has less than two devices', () => {
      const controller = initController();
      const deviceList = [
        {
          product: 'Cisco Spark Share',
        },
      ];
      controller.ownerType = 'place';
      controller.placeType = 'cloudberry';
      controller.showCorrectElements(deviceList);

      expect(controller.showMultipleDeviceWarning).toBe(false);
    });

    it('should not show multiple device warning when list has two devices that are Spark Voice and Spark Share', () => {
      const controller = initController();
      const deviceList = [
        {
          product: 'Cisco Spark Voice',
        },
        {
          product: 'Cisco Spark Share',
        },
      ];
      controller.ownerType = 'place';
      controller.placeType = 'cloudberry';
      controller.showCorrectElements(deviceList);

      expect(controller.showMultipleDeviceWarning).toBe(false);
    });

    it('should not show multiple device warning when list has two devices that are Spark Share and Spark Voice', () => {
      const controller = initController();
      const deviceList = [
        {
          product: 'Cisco Spark Share',
        },
        {
          product: 'Cisco Spark Voice',
        },
      ];
      controller.ownerType = 'place';
      controller.placeType = 'cloudberry';
      controller.showCorrectElements(deviceList);

      expect(controller.showMultipleDeviceWarning).toBe(false);
    });
  });
});
