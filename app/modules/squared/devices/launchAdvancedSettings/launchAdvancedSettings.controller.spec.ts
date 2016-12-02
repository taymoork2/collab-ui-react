namespace deviceAdvancedSettings {

  describe('LaunchAdvancedSettingsController', () => {

    let controller, authInfo, $controller, $modalInstance, $scope, $timeout, CsdmDeviceService;
    let rootScope;
    let device: any = {};

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Squared'));

    beforeEach(installPromiseMatchers);

    beforeEach(inject(($rootScope, _$controller_, _$timeout_, $q, _Authinfo_, _CsdmDeviceService_) => {

      $scope = $rootScope.$new();
      $timeout = _$timeout_;
      rootScope = $rootScope;
      authInfo = _Authinfo_;
      CsdmDeviceService = _CsdmDeviceService_;
      $modalInstance = {
        close: () => {
        }
      };

      $controller = _$controller_;

      spyOn(CsdmDeviceService, 'sendAdvancedSettingsOtp').and.returnValue($q.when({ data: {} }));

      spyOn($modalInstance, 'close').and.stub();

      spyOn(authInfo, 'getPrimaryEmail').and.returnValue('getPrimaryEmail@getPrimaryEmail');
      spyOn(authInfo, 'getUserName').and.returnValue('getUserName');
    }));

    function initController(device) {
      controller = $controller('LaunchAdvancedSettingsController', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        Authinfo: authInfo,
        currentDevice: device
      });
      $scope.$apply();
    }

    beforeEach(() => {
      device = {
        software: 'Spark Room OS 2016-11-30 a487137',
        isOnline: true,
        ip: '1.1.1.1',
        cisUuid: 'cisUuidcisUuidcisUuid',
        url: 'http://sdfdsfdsfsdfds',
        displayName: 'displayName'
      };
    });

    describe('init', () => {
      describe('with device online', () => {

        beforeEach(() => {
          device.isOnline = true;
        });

        describe('+supported sw', () => {

          beforeEach(() => {
            device.software = 'Spark Room OS 2016-11-30 a487137';
            initController(device);
            $timeout.flush();
          });

          it('should start in the connect state.', () => {
            expect(controller.state).toEqual(controller.states.connect);
          });
        });

        describe('+unsupported sw', () => {

          beforeEach(() => {
            device.software = 'Spark Room OS 2012-11-30 a4d7137';
            initController(device);
            $timeout.flush();
          });

          it('should be in the unsupportedSoftwareVersion state.', () => {
            expect(controller.state).toEqual(controller.states.unsupportedSoftwareVersion);
          });
        });
      });

      describe('with device offline', () => {

        beforeEach(() => {
          device.isOnline = false;
        });

        describe('+supported sw', () => {
          beforeEach(() => {
            device.software = 'Spark Room OS 2016-11-30 a487137';
            initController(device);
            $timeout.flush();
          });

          it('should be in the offline state.', () => {
            expect(controller.state).toEqual(controller.states.offline);
          });
        });

        describe('+unsupported sw', () => {

          beforeEach(() => {
            device.software = 'Spark Room OS 2012-11-30 a4d7137';
            initController(device);
            $timeout.flush();
          });

          it('should be in the unsupportedSoftwareVersion state.', () => {
            expect(controller.state).toEqual(controller.states.unsupportedSoftwareVersion);
          });
        });
      });
    });

    describe('offline state', () => {

      beforeEach(() => {
        device.isOnline = false;
        initController(device);
        $timeout.flush();
      });

      it('should start in the offline state.', () => {
        expect(controller.state).toEqual(controller.states.offline);
      });

      it('should not have button1', () => {
        expect(controller.state.button1text).toBeFalsy();
      });

      it('should have button2', () => {
        expect(controller.state.button2text).toBeTruthy();
      });

      it('should close the modal on button2', () => {
        expect(controller.state.button2Click).toEqual($modalInstance.close);
      });
    });

    describe('unsupportedSoftwareVersion state', () => {

      beforeEach(() => {
        device.software = 'Spark Room OS 2012-11-30 a4d7137';
        initController(device);
        $timeout.flush();
      });

      it('should start in the unsupportedSoftwareVersion state.', () => {
        expect(controller.state).toEqual(controller.states.unsupportedSoftwareVersion);
      });

      it('should not have button1', () => {
        expect(controller.state.button1text).toBeFalsy();
      });

      it('should have button2', () => {
        expect(controller.state.button2text).toBeTruthy();
      });

      it('should close the modal on button2', () => {
        expect(controller.state.button2Click).toEqual($modalInstance.close);
      });
    });

    describe('connect state', () => {
      beforeEach(() => {
        initController(device);
        $timeout.flush();
      });

      it('should start in the connect state.', () => {
        expect(controller.state).toEqual(controller.states.connect);
      });

      it('should have button1', () => {
        expect(controller.state.button1text).toBeTruthy();
      });

      it('should have button2', () => {
        expect(controller.state.button2text).toBeTruthy();
      });

      it('should not be in retry mode', () => {
        expect(controller.state.isRetry).toBeFalsy();
      });

      it('should close the modal on button1', () => {
        expect(controller.state.button1Click).toEqual($modalInstance.close);
      });
    });
  });
}
