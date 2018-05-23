describe('LaunchAdvancedSettingsController', () => {

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(installPromiseMatchers);

  let state = defaultState();

  function defaultState() {
    return {
      controller: <any>{},
      authInfo: <any>{},
      $controller: <any>{},
      $modalInstance: <any>{},
      $scope: <any>{},
      $timeout: <ng.ITimeoutService>{},
      CsdmDeviceService: <any>{},
      device: <any>{},
    };
  }

  afterEach(() => {
    state = defaultState(); //clean up memory
  });

  beforeEach(inject((_$controller_, _$timeout_) => {

    state.$timeout = _$timeout_;
    state.$controller = _$controller_;

    state.$scope = {
      $apply: jasmine.createSpy('apply'),
    };

    state.authInfo = {
      getPrimaryEmail: jasmine.createSpy('getPrimaryEmail').and.returnValue('getPrimaryEmail@getPrimaryEmail'),
      getUserName: jasmine.createSpy('getUserName').and.returnValue('getUserName'),
    };
    state.CsdmDeviceService = {
      sendAdvancedSettingsOtp: jasmine.createSpy('sendAdvancedSettingsOtp'),
    };
    state.$modalInstance = {
      close: jasmine.createSpy('close'),
    };
  }));

  function initController(device) {
    state.controller = state.$controller('LaunchAdvancedSettingsController', {
      $scope: state.$scope,
      $modalInstance: state.$modalInstance,
      Authinfo: state.authInfo,
      currentDevice: device,
    });
  }

  beforeEach(() => {
    state.device = {
      software: 'RoomOS 2016-11-30 a487137',
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
          state.device.software = 'RoomOS 2017-11-30 a487137';
          initController(state.device);
          state.$timeout.flush();
        });

        it('should start in the connect state.', () => {
          expect(state.controller.state).toEqual(state.controller.states.connect);
        });

        it('should have a static script block that never changes CSP hash.', () => {
          const script = state.controller.forwardingPageScript.replace('<script>', '').replace('</script>', '');
          // READ THIS: If this test fails, it means you changed anything in the forwardingPageScript. This script block has a CSP hash in csp-prod.config.js,
          // which adds it to the CSP header. If you have to change the forwardingPageScript, you MUST update the hash in the CSP header or the functionality will break.
          // Do not just update this test!! Make sure the feature still works with CSP!
          const CryptoJS = require('crypto-js');
          expect(CryptoJS.SHA256(script).toString(CryptoJS.enc.Base64)).toEqual('5zmUxCaNKNz+kTngvNTF8srDs9p8XHdW0oh+h9q46KQ=');
        });
      });

      describe('+re-branded supported sw', () => {

        beforeEach(() => {
          state.device.software = 'RoomOS 2017-11-30 a487137';
          initController(state.device);
          state.$timeout.flush();
        });

        it('should start in the connect state.', () => {
          expect(state.controller.state).toEqual(state.controller.states.connect);
        });
      });

      describe('+unsupported sw', () => {

        beforeEach(() => {
          state.device.software = 'Spark Unsupported OS 2016-11-30 a4d7137';
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

      describe('+re-branded supported sw', () => {
        beforeEach(() => {
          state.device.software = 'RoomOS 2016-11-30 a487137';
          initController(state.device);
          state.$timeout.flush();
        });

        it('should be in the offline state.', () => {
          expect(state.controller.state).toEqual(state.controller.states.offline);
        });
      });

      describe('+unsupported sw', () => {

        beforeEach(() => {
          state.device.software = 'Spark Unsupported RoomOS 2012-11-30 a4d7137';
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
      state.device.software = 'Unsupported Spark Room OS 2012-11-30 a4d7137';
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
