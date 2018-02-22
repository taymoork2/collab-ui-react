'use strict';

describe('clusterCreationWizardController', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var $q, $scope, controller, $state, $stateParams, AddResourceCommonServiceV2, Notification, $translate, $modalInstance, $modal, firstTimeSetup, yesProceed;
  var fakeModal = {
    result: {
      then: function (confirmCallback, cancelCallback) {
        this.confirmCallBack = confirmCallback;
        this.cancelCallback = cancelCallback;
      },
    },
    close: function (item) {
      this.result.confirmCallBack(item);
    },
    dismiss: function (type) {
      this.result.cancelCallback(type);
    },
  };
  beforeEach(inject(function (_Notification_, _$translate_, _$state_, _$stateParams_, _AddResourceCommonServiceV2_, $controller, _$q_, _$modal_, _$rootScope_) {
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    $stateParams = _$stateParams_;
    AddResourceCommonServiceV2 = _AddResourceCommonServiceV2_;
    $translate = _$translate_;
    Notification = _Notification_;
    $modalInstance = {
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss'),
    };
    $modal = _$modal_;
    yesProceed = true;
    firstTimeSetup = true;
    controller = $controller('clusterCreationWizardController', {
      $q: $q,
      Notification: Notification,
      $translate: $translate,
      $state: $state,
      $stateParams: $stateParams,
      AddResourceCommonServiceV2: AddResourceCommonServiceV2,
      $modalInstance: $modalInstance,
      $modal: $modal,
      yesProceed: yesProceed,
      firstTimeSetup: firstTimeSetup,
    });
  }));
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('AddResourceCommonServiceV2.enableMediaServiceEntitlements should be called for redirectToTargetAndCloseWindowClicked', function () {
    var respnse = {
      status: 204,
    };
    spyOn(AddResourceCommonServiceV2, 'enableMediaServiceEntitlements').and.returnValue([$q.resolve(respnse), $q.resolve(respnse)]);
    spyOn(AddResourceCommonServiceV2, 'createFirstTimeSetupCluster').and.returnValue($q.resolve(respnse));
    spyOn(AddResourceCommonServiceV2, 'enableMediaService').and.returnValue($q.resolve(respnse));
    spyOn(AddResourceCommonServiceV2, 'redirectPopUpAndClose').and.returnValue($q.resolve(respnse));
    controller.redirectToTargetAndCloseWindowClicked();
    $scope.$apply();
    expect(AddResourceCommonServiceV2.enableMediaServiceEntitlements).toHaveBeenCalled();
    expect(AddResourceCommonServiceV2.createFirstTimeSetupCluster).toHaveBeenCalled();
    expect(AddResourceCommonServiceV2.enableMediaService).toHaveBeenCalled();
    expect(AddResourceCommonServiceV2.redirectPopUpAndClose).toHaveBeenCalled();
  });


  it('AddResourceCommonServiceV2.enableMediaServiceEntitlements should be called for redirectToTargetAndCloseWindowClicked Filure scenario', function () {
    var respnse = {
      status: 204,
    };
    spyOn(AddResourceCommonServiceV2, 'enableMediaServiceEntitlements').and.returnValue([$q.resolve(undefined), $q.resolve(respnse)]);
    spyOn(AddResourceCommonServiceV2, 'createFirstTimeSetupCluster').and.returnValue($q.resolve(respnse));
    spyOn(AddResourceCommonServiceV2, 'enableMediaService').and.returnValue($q.resolve(respnse));
    spyOn(AddResourceCommonServiceV2, 'redirectPopUpAndClose').and.returnValue($q.resolve(respnse));
    controller.redirectToTargetAndCloseWindowClicked();
    $scope.$apply();
    expect(AddResourceCommonServiceV2.enableMediaServiceEntitlements).toHaveBeenCalled();
    expect(AddResourceCommonServiceV2.createFirstTimeSetupCluster).not.toHaveBeenCalled();
    expect(AddResourceCommonServiceV2.enableMediaService).not.toHaveBeenCalled();
    expect(AddResourceCommonServiceV2.redirectPopUpAndClose).not.toHaveBeenCalled();
  });

  it('AddResourceCommonServiceV2.addRedirectTargetClicked should be called for redirectToTargetAndCloseWindowClicked not first time setup', function () {
    var respnse = {
      status: 204,
    };
    controller.firstTimeSetup = false;
    spyOn(AddResourceCommonServiceV2, 'addRedirectTargetClicked').and.returnValue($q.resolve(respnse));
    spyOn(AddResourceCommonServiceV2, 'redirectPopUpAndClose').and.returnValue($q.resolve(respnse));
    controller.redirectToTargetAndCloseWindowClicked();
    $scope.$apply();
    expect(AddResourceCommonServiceV2.addRedirectTargetClicked).toHaveBeenCalled();
    expect(AddResourceCommonServiceV2.redirectPopUpAndClose).toHaveBeenCalled();
  });

  it('controller.enableRedirectToTarget should be true for next()', function () {
    controller.selectedCluster = 'selectedCluster';
    controller.hostName = 'hostName';
    controller.next();
    expect(controller.enableRedirectToTarget).toBe(true);
  });
  it('controller.noProceed should be true for next()', function () {
    controller.radio = '0';
    controller.noProceed = false;
    controller.next();
    expect(controller.noProceed).toBe(true);
  });
  it('clusterCreationWizardController closeSetupModal should close the modal', function () {
    spyOn($state, 'go');
    controller.closeSetupModal(true);
    expect($modalInstance.dismiss).toHaveBeenCalled();
  });
  xit('clusterCreationWizardController closeSetupModal should close the modal when firstTimeSetup is false', function () {
    spyOn($modalInstance, 'close');
    firstTimeSetup = false;
    controller.closeSetupModal(false);
    expect($modalInstance.close).toHaveBeenCalled();
  });
  it('clusterCreationWizardController closeSetupModal should open the confirm-setup-cancel dialog', function () {
    spyOn($state, 'go');
    spyOn($modal, 'open').and.returnValue(fakeModal);
    controller.firstTimeSetup = true;
    controller.closeSetupModal(false);
    expect($modal.open).toHaveBeenCalled();
  });
  it('clusterCreationWizardController back should set the enableRedirectToTarget false', function () {
    controller.back();
    expect(controller.enableRedirectToTarget).toBeFalsy();
  });
  it('clusterCreationWizardController canGoNext should disable the next button when the field is empty', function () {
    controller.showDownloadableOption = false;
    controller.canGoNext();
    expect(controller.canGoNext()).toBeFalsy();
  });
  it('clusterCreationWizardController canGoNext should enable the next button when firstTimeSetup is true and yesProceed is false', function () {
    controller.firstTimeSetup = true;
    controller.yesProceed = false;
    controller.canGoNext();
    expect(controller.canGoNext()).toBeTruthy();
  });
  it('clusterCreationWizardController canGoNext should enable the next button when the feild is filled', function () {
    controller.firstTimeSetup = true;
    controller.yesProceed = true;
    controller.hostName = 'sampleHost';
    controller.selectedCluster = 'sampleCluster';
    controller.canGoNext();
    expect(controller.canGoNext()).toBeTruthy();
  });
});
