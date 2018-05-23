import testModule from './index';
import { SparkAssistantSettingController } from './spark-assistant-setting.controller';

describe('Controller: SparkAssistantSettingController', () => {

  let $scope, $controller, $q;
  let SparkAssistantService;
  let controller: SparkAssistantSettingController;

  beforeEach(angular.mock.module(testModule));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _SparkAssistantService_, _$q_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    SparkAssistantService = _SparkAssistantService_;
  }

  function initSpies() {
    spyOn(SparkAssistantService, 'updateSpeechService').and.returnValue($q.resolve({}));
    spyOn(SparkAssistantService, 'getSpeechServiceOptIn').and.returnValue($q.resolve({}));
  }

  function initController() {
    controller = $controller(SparkAssistantSettingController, {
      $scope: $scope,
    });
    controller.$onInit();
    $scope.$apply();
  }

  describe('SparkAssistant Opt out', () => {
    beforeEach(initGetSpeechServiceWithResult({ optIn: false, activationStatus: 'DISABLED' }));
    beforeEach(initController);

    it('should return sparkAssistant disabled', () => {
      expect(controller.sparkAssistantEnabled).toBeFalsy();
    });
  });

  describe('SparkAssistant Opt in', () => {
    beforeEach(initGetSpeechServiceWithResult({ optIn: true, activationStatus: 'ENABLED' }));
    beforeEach(initController);

    it('should return sparkAssistant Enabled', () => {
      expect(controller.sparkAssistantEnabled).toBeTruthy();
    });
  });

  describe('update SparkAssistant opt in/out Setting', () => {
    beforeEach(initGetSpeechServiceWithResult({ optIn: true, activationStatus: 'ENABLED' }));
    beforeEach(initController);

    it('should optin Spark Assistant', () => {
      controller.updateSparkAssistantEnabled();
      expect(controller.sparkAssistantEnabled).toBeTruthy();
      expect(SparkAssistantService.updateSpeechService).toHaveBeenCalledWith(true);
    });

    it('should optout Spark Assistant', () => {
      controller.sparkAssistantEnabled = false;
      controller.updateSparkAssistantEnabled();
      expect(controller.sparkAssistantEnabled).toBeFalsy();
      expect(SparkAssistantService.updateSpeechService).toHaveBeenCalledWith(false);
    });
  });

  describe('should optin/optout SparkAssistant', () => {
    beforeEach(initGetSpeechServiceWithResult({ optIn: true, activationStatus: 'PROCESSING' }));
    beforeEach(initController);

    it('should check OptIn in Progress, Enabled', () => {
      expect(SparkAssistantService.getSpeechServiceOptIn).toHaveBeenCalled();
      expect(controller.sparkAssistantEnabled).toBeTruthy();
      expect(controller.inProgress).toBeTruthy();
      SparkAssistantService.getSpeechServiceOptIn.and.returnValue($q.resolve({ optIn: true, activationStatus: 'ENABLED' }));
    });

    it('should check SparkAssistant disabled', () => {
      controller.sparkAssistantEnabled = false;
      controller.updateSparkAssistantEnabled();
      SparkAssistantService.getSpeechServiceOptIn.and.returnValue($q.resolve({ optIn: false, activationStatus: 'DISABLED' }));
      expect(controller.sparkAssistantEnabled).toBeFalsy();
    });
  });

  function initGetSpeechServiceWithResult(result: any) {
    return () => {
      SparkAssistantService.getSpeechServiceOptIn.and.returnValue($q.resolve(result));
    };
  }
});
