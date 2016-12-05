namespace deviceAdvancedSettings {

  describe('LaunchAdvancedSettingsController', () => {

    let state: any = {
      controller: <any>{},
      authInfo: <any>{},
      $controller: <any>{},
      $modalInstance: <any>{},
      $scope: <ng.IScope>{},
      $timeout: <ng.ITimeoutService>{},
      CsdmDeviceService: <any>{},
      rootScope: <ng.IScope>{},
      device: <any>{},
    };

    afterEach(() => {
      state = {}; //clean up memory
    });

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Squared'));

    beforeEach(installPromiseMatchers);

    beforeEach(inject(($rootScope, _$controller_, _$timeout_, $q, _Authinfo_, _CsdmDeviceService_) => {

      state.$scope = $rootScope.$new();
      state.$timeout = _$timeout_;
      state.rootScope = $rootScope;
      state.authInfo = _Authinfo_;
      state.CsdmDeviceService = _CsdmDeviceService_;
      state.$modalInstance = {
        close: () => {
        },
      };

      state.$controller = _$controller_;

      spyOn(state.CsdmDeviceService, 'sendAdvancedSettingsOtp').and.returnValue($q.when({ data: {} }));

      spyOn(state.$modalInstance, 'close').and.stub();

      spyOn(state.authInfo, 'getPrimaryEmail').and.returnValue('getPrimaryEmail@getPrimaryEmail');
      spyOn(state.authInfo, 'getUserName').and.returnValue('getUserName');
    }));

    function initController(device) {
      state.controller = state.$controller('LaunchAdvancedSettingsController', {
        $scope: state.$scope,
        $modalInstance: state.$modalInstance,
        Authinfo: state.authInfo,
        currentDevice: device,
      });
      state.$scope.$apply();
    }

    beforeEach(() => {
      state.device = {
        software: 'Spark Room OS 2016-11-30 a487137',
        isOnline: true,
        ip: '1.1.1.1',
        cisUuid: 'cisUuidcisUuidcisUuid',
        url: 'http://sdfdsfdsfsdfds',
        displayName: 'displayName',
      };
    });

    describe('init', () => {
      describe('with device online', () => {

        beforeEach(() => {
          state.device.isOnline = true;
        });

        describe('+supported sw', () => {

          beforeEach(() => {
            state.device.software = 'Spark Room OS 2016-11-30 a487137';
            initController(state.device);
            state.$timeout.flush();
          });

          it('should start in the connect state.', () => {
            expect(state.controller.state).toEqual(state.controller.states.connect);
          });
        });

        describe('+unsupported sw', () => {

          beforeEach(() => {
            state.device.software = 'Spark Room OS 2012-11-30 a4d7137';
            initController(state.device);
            state.$timeout.flush();
          });

          it('should be in the unsupportedSoftwareVersion state.', () => {
            expect(state.controller.state).toEqual(state.controller.states.unsupportedSoftwareVersion);
          });
        });
      });

      describe('with device offline', () => {

        beforeEach(() => {
          state.device.isOnline = false;
        });

        describe('+supported sw', () => {
          beforeEach(() => {
            state.device.software = 'Spark Room OS 2016-11-30 a487137';
            initController(state.device);
            state.$timeout.flush();
          });

          it('should be in the offline state.', () => {
            expect(state.controller.state).toEqual(state.controller.states.offline);
          });
        });

        describe('+unsupported sw', () => {

          beforeEach(() => {
            state.device.software = 'Spark Room OS 2012-11-30 a4d7137';
            initController(state.device);
            state.$timeout.flush();
          });

          it('should be in the unsupportedSoftwareVersion state.', () => {
            expect(state.controller.state).toEqual(state.controller.states.unsupportedSoftwareVersion);
          });
        });
      });
    });

    describe('offline state', () => {

      beforeEach(() => {
        state.device.isOnline = false;
        initController(state.device);
        state.$timeout.flush();
      });

      it('should start in the offline state.', () => {
        expect(state.controller.state).toEqual(state.controller.states.offline);
      });

      it('should not have button1', () => {
        expect(state.controller.state.button1text).toBeFalsy();
      });

      it('should have button2', () => {
        expect(state.controller.state.button2text).toBeTruthy();
      });

      it('should close the modal on button2', () => {
        expect(state.controller.state.button2Click).toEqual(state.$modalInstance.close);
      });
    });

    describe('unsupportedSoftwareVersion state', () => {

      beforeEach(() => {
        state.device.software = 'Spark Room OS 2012-11-30 a4d7137';
        initController(state.device);
        state.$timeout.flush();
      });

      it('should start in the unsupportedSoftwareVersion state.', () => {
        expect(state.controller.state).toEqual(state.controller.states.unsupportedSoftwareVersion);
      });

      it('should not have button1', () => {
        expect(state.controller.state.button1text).toBeFalsy();
      });

      it('should have button2', () => {
        expect(state.controller.state.button2text).toBeTruthy();
      });

      it('should close the modal on button2', () => {
        expect(state.controller.state.button2Click).toEqual(state.$modalInstance.close);
      });
    });

    describe('connect state', () => {
      beforeEach(() => {
        initController(state.device);
        state.$timeout.flush();
      });

      it('should start in the connect state.', () => {
        expect(state.controller.state).toEqual(state.controller.states.connect);
      });

      it('should have button1', () => {
        expect(state.controller.state.button1text).toBeTruthy();
      });

      it('should have button2', () => {
        expect(state.controller.state.button2text).toBeTruthy();
      });

      it('should not be in retry mode', () => {
        expect(state.controller.state.isRetry).toBeFalsy();
      });

      it('should close the modal on button1', () => {
        expect(state.controller.state.button1Click).toEqual(state.$modalInstance.close);
      });
    });
  });
}
