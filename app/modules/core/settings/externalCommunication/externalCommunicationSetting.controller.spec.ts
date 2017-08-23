import testModule from './index';
import { ExternalCommunicationSettingController } from './externalCommunicationSetting.controller';

describe('Controller: ExternalCommunicationSettingController', () => {

  let controller: ExternalCommunicationSettingController;
  let $scope, $controller, $q;
  let AccountOrgService, Authinfo, ProPackService;

  beforeEach(angular.mock.module(testModule));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _AccountOrgService_, _Authinfo_, _ProPackService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    AccountOrgService = _AccountOrgService_;
    Authinfo = _Authinfo_;
    ProPackService = _ProPackService_;
  }

  function initSpies() {
    spyOn(AccountOrgService, 'getBlockExternalCommunication');
    spyOn(AccountOrgService, 'setBlockExternalCommunication');
    spyOn(ProPackService, 'hasProPackPurchasedOrNotEnabled').and.returnValue($q.resolve(true));
  }

  function initController() {
    controller = $controller(ExternalCommunicationSettingController, {
      $scope: $scope,
    });
    controller.$onInit();
    $scope.$apply();
  }

  describe('constructor()', () => {

    describe('when getBlockExternalCommunication fail', () => {
      beforeEach(initGetBlockExternalCommunicationReject());
      beforeEach(initController);

      it('should not set dataloaded and no value for isBlockExternalCommunication', () => {
        expect(controller.isBlockExternalCommunication).toBeFalsy();
        expect(controller.isBlockExternalCommunicationSettingLoaded).toBeFalsy();
      });
    });

    describe('when getBlockExternalCommunication return blockExternalCommunications set to true', () => {
      beforeEach(initGetBlockExternalCommunicationWithResult(true));
      beforeEach(initController);

      it('should set dataloaded and true for isBlockExternalCommunication', () => {
        expect(controller.isBlockExternalCommunication).toBeTruthy();
        expect(controller.isBlockExternalCommunicationSettingLoaded).toBeTruthy();
      });
    });

    describe('when getBlockExternalCommunication return blockExternalCommunications set to false', () => {
      beforeEach(initGetBlockExternalCommunicationWithResult(false));
      beforeEach(initController);

      it('should set dataloaded and true for isBlockExternalCommunication', () => {
        expect(controller.isBlockExternalCommunication).toBeFalsy();
        expect(controller.isBlockExternalCommunicationSettingLoaded).toBeTruthy();
      });
    });
  });

  describe('updateBlockExternalCommunicationSetting', () => {
    beforeEach(function() {
      initGetBlockExternalCommunicationWithResult(false);
      initGetBlockExternalCommunication();
      initController();
    });

    it('should call AccountOrgService to save the value true', () => {
      controller.isBlockExternalCommunication = true;

      controller.updateBlockExternalCommunicationSetting();

      expect(AccountOrgService.setBlockExternalCommunication)
        .toHaveBeenCalledWith(Authinfo.getOrgId(), true);
    });

    it('should call AccountOrgService to save the value false', () => {
      controller.isBlockExternalCommunication = false;

      controller.updateBlockExternalCommunicationSetting();

      expect(AccountOrgService.setBlockExternalCommunication)
        .toHaveBeenCalledWith(Authinfo.getOrgId(), false);
    });

    function initGetBlockExternalCommunication() {
      AccountOrgService.setBlockExternalCommunication.and.returnValue($q.resolve({}));
    }
  });

  function initGetBlockExternalCommunicationWithResult(result: boolean) {
    return () => {
      AccountOrgService.getBlockExternalCommunication.and.returnValue($q.resolve(result));
    };
  }

  function initGetBlockExternalCommunicationReject() {
    return () => {
      AccountOrgService.getBlockExternalCommunication.and.returnValue($q.reject({}));
    };
  }
});
