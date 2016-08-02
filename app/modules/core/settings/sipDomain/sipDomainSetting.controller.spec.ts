namespace globalsettings {

describe('Controller: EnterpriseSettingsCtrl', ()  => {
  let controller, $scope, Config, Orgservice, SparkDomainManagementService, $q, $controller, Notification;
  let orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
  let getOrgStatus = 200;
  let rootScope;

  let authInfo = {
    getOrgId: sinon.stub().returns('bcd7afcd-839d-4c61-a7a8-31c6c7f016d7')
  };

  beforeEach(angular.mock.module(($provide) => {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(angular.mock.module('Core'));

  beforeEach(installPromiseMatchers);

  beforeEach(inject(($rootScope, _$controller_, _Notification_, _Config_, _$q_, _Orgservice_, _SparkDomainManagementService_) => {
    $scope = $rootScope.$new();
    rootScope = $rootScope;
    SparkDomainManagementService = _SparkDomainManagementService_;
    Config = _Config_;
    $controller = _$controller_;
    Orgservice = _Orgservice_;
    Notification = _Notification_;
    $q = _$q_;

    $scope.wizard = {
      nextTab: sinon.stub()
    };

    spyOn($scope.wizard, 'nextTab');
    spyOn($scope, '$emit').and.callThrough();
    spyOn(SparkDomainManagementService, 'checkDomainAvailability').and.returnValue($q.when({
      data: {
        isDomainAvailable: true,
        isDomainReserved: false
      }
    }));

    spyOn(SparkDomainManagementService, 'addSipDomain').and.returnValue($q.when({
      data: {
        isDomainAvailable: false,
        isDomainReserved: true
      }
    }));

    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when([{
      licenses: [{
        offerName: 'SD'
      }]
    }]));

    spyOn(Orgservice, 'getOrg').and.callFake((callback, status) => {
      callback(orgServiceJSONFixture.getOrg, getOrgStatus);
    });
    spyOn(Notification, 'error');
  }));

  function initController() {
    controller = $controller('SipDomainSettingController', {
      $scope: $scope,
      $rootScope: rootScope,
      Authinfo: authInfo
    });

    $scope.$apply();
  }

  describe('test Orgservice getOrg callback setting displayName', () => {
    beforeEach(() => {
      Orgservice.getOrg.and.callFake((callback, status) => {
        callback(orgServiceJSONFixture.getOrg, 201);
      });
      initController();
    });

    it('should gracefully error',() => {
      expect(Notification.error).toHaveBeenCalled();
    });
  });

  describe('test if checkSipDomainAvailability function sets isUrlAvailable to true', () => {
    beforeEach(initController);

    it('should emit wizardNextDisabled', () => {
      expect($scope.$emit).toHaveBeenCalledWith('wizardNextButtonDisable', true);
    });

    it('should check if checkSipDomainAvailability in success state sets isUrlAvailable to true ', (done) => {
      controller.inputValue = 'shatest1';
      controller.checkSipDomainAvailability().then(() => {
        expect(controller.isUrlAvailable).toEqual(true);
        expect(SparkDomainManagementService.checkDomainAvailability).toHaveBeenCalledWith(controller.inputValue);
        done();
      });
      $scope.$apply();
    });

    it('should disable the field and clear error on the field validation', () => {
      controller._inputValue = controller._validatedValue = "alalalalalong!";
      controller.isConfirmed = true;
      controller.saveDomain();
      $scope.$apply();
      expect(controller.isError).toEqual(false);
      expect(controller.isDisabled).toEqual(true);
    });

    it('should check if checkSipDomainAvailability in success state is set to false ', () => {
      controller.inputValue = 'amtest2';
      controller.checkSipDomainAvailability();
      expect(controller.isUrlAvailable).toEqual(false);
    });
  });

  describe('test checkSSAReservation', () => {
    beforeEach(initController);

    it('should enable Next button when isSSAReserved is true', () => {
        controller.isSSAReserved = true;
        expect($scope.$emit).toHaveBeenCalledWith('wizardNextButtonDisable', false);
    });

    it('should enable Next button when isSSARerved is false and depends on isConfirmed', () => {
        controller.isSSAReserved = false;
        expect($scope.$emit).toHaveBeenCalledWith('wizardNextButtonDisable', !controller.isConfirmed);
    });
  });

  describe('test if addSipDomain errors gracefully', () => {
    beforeEach(() => {
      SparkDomainManagementService.addSipDomain.and.returnValue($q.reject());
      initController();
    });

    it('addSipDomain should error gracefully', () => {

      controller._inputValue = controller._validatedValue = "alalalalalong!";
      controller.isConfirmed = true;
      controller.saveDomain();
      $scope.$apply();
      expect(Notification.error).toHaveBeenCalled();
    });
  });

  describe('test if checkRoomLicense function sets isRoomLicensed to true', () => {
    beforeEach(initController);

    it('checkRoomLicense should set Room license to true', () => {
      expect(controller.isRoomLicensed).toEqual(true);
    });
  });

  describe('test if checkRoomLicense function sets isRoomLicensed to false', () => {
    beforeEach(() => {
      Orgservice.getLicensesUsage.and.returnValue($q.when([{
        licenses: [{
          offerName: 'CF'
        }]
      }]));
      initController();
    });

    it('checkRoomLicense should set Room license to false', () => {
      expect(controller.isRoomLicensed).toEqual(false);
    });
  });
});
}
