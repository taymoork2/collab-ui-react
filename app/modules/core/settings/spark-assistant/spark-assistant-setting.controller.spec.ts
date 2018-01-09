import testModule from './index';
import { SparkAssistantSettingController } from './spark-assistant-setting.controller';

describe('Controller: SparkAssistantSettingController', () => {

  let $scope, $controller, $q;
  let Authinfo, SparkAssistantService;
  let controller: SparkAssistantSettingController;

  beforeEach(angular.mock.module(testModule));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _Authinfo_, _SparkAssistantService_, _$q_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    Authinfo = _Authinfo_;
    $q = _$q_;
    SparkAssistantService = _SparkAssistantService_;
  }

  function initSpies() {
    spyOn(SparkAssistantService, 'updateSpeechService').and.returnValue($q.resolve({}));
    spyOn(SparkAssistantService, 'getSpeechServiceOptIn');
  }

  function initController() {
    controller = $controller(SparkAssistantSettingController, {
      $scope: $scope,
    });
    $scope.$apply();
  }

  describe('should return sparkAssistant Opt out', () => {
    beforeEach(initGetSpeechServiceWithResult({ optIn: false }));
    beforeEach(initController);

    it('should return sparkAssistant not enabled or Opt out', () => {
      expect(controller.sparkAssistantEnabled).toBeFalsy();
    });
  });

  describe('should return sparkAssistant Opt in', () => {
    beforeEach(initGetSpeechServiceWithResult({ optIn: true }));
    beforeEach(initController);

    it('should return sparkAssistantEnabled true', () => {
      SparkAssistantService.getSpeechServiceOptIn.and.returnValue($q.resolve( { optIn: true }));
      expect(controller.sparkAssistantEnabled).toBeTruthy();
    });
  });

  describe('updateSparkAssistant opt in/out Setting', () => {
    beforeEach(initGetSpeechServiceWithResult({ optIn: true }));
    beforeEach(initController);

    it('should call SparkAssistantService to optin', () => {
      controller.updateSparkAssistantEnabled();
      expect(SparkAssistantService.updateSpeechService).toHaveBeenCalledWith(true);
    });

    it('should call SparkAssistantService to optout', () => {
      controller.sparkAssistantEnabled = false;
      controller.updateSparkAssistantEnabled();
      expect(SparkAssistantService.updateSpeechService).toHaveBeenCalledWith(false);
    });
  });

  function initGetSpeechServiceWithResult(result: any) {
    return () => {
      SparkAssistantService.getSpeechServiceOptIn.and.returnValue($q.resolve(result));
    };
  }
});
