'use strict';

describe('UserManageOrgController', function () {

  ///////////////////

  function init() {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies('$scope', '$stateParams', '$controller', 'Analytics', 'UserCsvService', 'OnboardService', 'Orgservice');

    this.$state = {
      modal: {
        dismiss: jasmine.createSpy('dismiss').and.returnValue(true),
      },
      go: jasmine.createSpy('go'),
    };

    spyOn(this.Analytics, 'trackAddUsers');
  }

  function initController() {
    this.controller = this.$controller('UserManageOrgController', {
      $scope: this.$scope,
      $state: this.$state,
      $stateParams: this.$stateParams,
      Analytics: this.Analytics,
      UserCsvService: this.UserCsvService,
      OnboardService: this.OnboardService,
      Orgservice: this.Orgservice,
    });
    this.$scope.$apply();
  }

  function initControllerAndDefaults() {
    spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(function (callback) {
      callback({
        success: false,
      });
    });

    initController.apply(this);
  }

  function initControllerAndUnlicensedUsers() {
    spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(function (callback) {
      callback({
        success: true,
        totalResults: 1,
      });
    });

    initController.apply(this);
  }

  beforeEach(init);

  it('should init with expected responses when getUnlicensedUsers fails', function () {
    initControllerAndDefaults.apply(this);

    expect(this.controller.manageType).toEqual('manual');
    expect(this.controller.maxUsersInCSV).toEqual(this.UserCsvService.maxUsersInCSV);
    expect(this.controller.maxUsersInManual).toEqual(this.OnboardService.maxUsersInManual);
    expect(this.controller.isOverExportThreshold).toBeFalsy();
    expect(this.controller.convertableUsers).toBeFalsy();
  });

  it('should init with expected responses when getUnlicensedUsers returns 0 unlicensed users', function () {
    spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(function (callback) {
      callback({
        success: true,
        totalResults: 0,
      });
    });

    initController.apply(this);

    expect(this.controller.manageType).toEqual('manual');
    expect(this.controller.maxUsersInCSV).toEqual(this.UserCsvService.maxUsersInCSV);
    expect(this.controller.maxUsersInManual).toEqual(this.OnboardService.maxUsersInManual);
    expect(this.controller.isOverExportThreshold).toBeFalsy();
    expect(this.controller.convertableUsers).toBeFalsy();
  });

  it('should init with expected responses when getUnlicensedUsers returns 1 or more unlicensed users', function () {
    initControllerAndUnlicensedUsers.apply(this);

    expect(this.controller.manageType).toEqual('manual');
    expect(this.controller.maxUsersInCSV).toEqual(this.UserCsvService.maxUsersInCSV);
    expect(this.controller.maxUsersInManual).toEqual(this.OnboardService.maxUsersInManual);
    expect(this.controller.isOverExportThreshold).toBeFalsy();
    expect(this.controller.convertableUsers).toBeTruthy();
  });

  it('should cancel modal', function () {
    initControllerAndDefaults.apply(this);

    expect(this.$state.modal.dismiss).toHaveBeenCalledTimes(0);
    this.controller.cancelModal();
    expect(this.$state.modal.dismiss).toHaveBeenCalledTimes(1);
    expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
  });

  it('should go to users.add', function () {
    initControllerAndDefaults.apply(this);

    this.controller.onNext();
    expect(this.$state.go).toHaveBeenCalledWith('users.add');
    expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.NEXT, this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL);
  });

  it('should go to users.csv', function () {
    initControllerAndDefaults.apply(this);
    this.controller.manageType = 'bulk';

    this.controller.onNext();
    expect(this.$state.go).toHaveBeenCalledWith('users.csv');
    expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.sections.ADD_USERS.eventNames.CSV_UPLOAD, this.Analytics.sections.ADD_USERS.uploadMethods.CSV);
  });

  it('should go to users.manage.advanced.add.ob.installConnector', function () {
    initControllerAndDefaults.apply(this);
    this.controller.manageType = 'advanced';

    this.controller.onNext();
    expect(this.$state.go).toHaveBeenCalledWith('users.manage.advanced.add.ob.installConnector');
    expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.sections.ADD_USERS.eventNames.INSTALL_CONNECTOR, this.Analytics.sections.ADD_USERS.uploadMethods.SYNC);
  });

  it('should go to users.convert', function () {
    initControllerAndUnlicensedUsers.apply(this);
    this.controller.manageType = 'convert';

    this.controller.onNext();
    expect(this.$state.go).toHaveBeenCalledWith('users.convert', {
      manageUsers: true,
    });
    expect(this.Analytics.trackAddUsers).not.toHaveBeenCalled();
  });
});
