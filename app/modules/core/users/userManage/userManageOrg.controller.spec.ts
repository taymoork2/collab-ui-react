import moduleName from './index';

describe('UserManageOrgController', () => {
  ///////////////////

  function init() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      '$window',
      'Authinfo',
      'Analytics',
      'AutoAssignTemplateModel',
      'AutoAssignTemplateService',
      'DirSyncService',
      'FeatureToggleService',
      'Notification',
      'OnboardService',
      'Orgservice',
      'UserCsvService',
      'UserManageService',
    );

    this.$state = {
      modal: {
        dismiss: jasmine.createSpy('dismiss').and.returnValue(true),
        closed: this.$q.resolve(),
      },
      go: jasmine.createSpy('go'),
    };

    spyOn(this.Analytics, 'trackAddUsers');
    spyOn(this.$window, 'open');
    spyOn(this.UserManageService, 'gotoNextStateForManageType');
  }

  function initController() {
    this.initController('UserManageOrgController', {
      controllerLocals: {
        $scope: this.$scope,
        $state: this.$state,
        $stateParams: this.$stateParams,
        Analytics: this.Analytics,
        DirSyncService: this.DirSyncService,
        FeatureToggleService: this.FeatureToggleService,
        OnboardService: this.OnboardService,
        Orgservice: this.Orgservice,
        UserCsvService: this.UserCsvService,
      },
    });
  }

  function initControllerAndDefaults() {
    spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(function (callback) {
      callback({
        success: false,
      });
    });
    spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(false);

    initController.call(this);
  }

  function initControllerAndAutoAssignFeatureToggleOn(spies: {
    isEnabledForOrg?,
    getTemplates?,
  } = {}) {
    const {
      isEnabledForOrg = this.$q.resolve(true),
      getTemplates = this.$q.resolve([{
        name: 'Default',
        foo: 'bar',
      }]),
    } = spies;
    spyOn(this.AutoAssignTemplateService, 'isEnabledForOrg').and.returnValue(isEnabledForOrg);
    spyOn(this.AutoAssignTemplateService, 'getTemplates').and.returnValue(getTemplates);

    initController.call(this);
  }

  function initControllerAndDirSyncEnabled() {
    spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(true);

    initController.call(this);
  }

  function initControllerAndUnlicensedUsers() {
    spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(function (callback) {
      callback({
        success: true,
        totalResults: 1,
      });
    });
    initController.call(this);
  }

  beforeEach(init);

  it('should init with expected responses when getUnlicensedUsers fails', function () {
    initControllerAndDefaults.call(this);

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

    initController.call(this);

    expect(this.controller.manageType).toEqual('manual');
    expect(this.controller.maxUsersInCSV).toEqual(this.UserCsvService.maxUsersInCSV);
    expect(this.controller.maxUsersInManual).toEqual(this.OnboardService.maxUsersInManual);
    expect(this.controller.isOverExportThreshold).toBeFalsy();
    expect(this.controller.convertableUsers).toBeFalsy();
  });

  it('should init with expected responses when getUnlicensedUsers returns 1 or more unlicensed users', function () {
    initControllerAndUnlicensedUsers.call(this);

    expect(this.controller.manageType).toEqual('manual');
    expect(this.controller.maxUsersInCSV).toEqual(this.UserCsvService.maxUsersInCSV);
    expect(this.controller.maxUsersInManual).toEqual(this.OnboardService.maxUsersInManual);
    expect(this.controller.isOverExportThreshold).toBeFalsy();
    expect(this.controller.convertableUsers).toBeTruthy();
  });

  it('should cancel modal', function () {
    initControllerAndDefaults.call(this);

    expect(this.$state.modal.dismiss).toHaveBeenCalledTimes(0);
    this.controller.cancelModal();
    expect(this.$state.modal.dismiss).toHaveBeenCalledTimes(1);
    expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
  });

  it('should go to settings page if isDirSyncEnabled is true', function () {
    initControllerAndDirSyncEnabled.apply(this);
    this.controller.handleDirSyncService();
    this.$scope.$apply();

    expect(this.$state.go).toHaveBeenCalledWith('settings', {
      showSettings: 'dirsync',
    });
    expect(this.$state.modal.dismiss).toHaveBeenCalled();
  });

  it('should go to an external link if isDirSyncEnabled is false', function () {
    initControllerAndDefaults.apply(this);
    this.controller.handleDirSyncService();
    this.$scope.$apply();

    expect(this.UserManageService.gotoNextStateForManageType).toHaveBeenCalledWith('advancedNoDS');
  });

  describe('onNext():', () => {
    it('should call UserManageService.gotoNextStateForManageType()', function () {
      initControllerAndDefaults.call(this);
      this.controller.onNext('my-manage-type');
      expect(this.UserManageService.gotoNextStateForManageType).toHaveBeenCalledWith('my-manage-type');
    });
  });

  describe('initConvertableUsers():', function () {
    it('should call "Orgservice.getUnlicensedUsers()"', function () {
      spyOn(this.Orgservice, 'getUnlicensedUsers');
      initController.call(this);
      this.controller.initConvertableUsers();
      expect(this.Orgservice.getUnlicensedUsers).toHaveBeenCalled();
    });
  });

  describe('initDefaultAutoAssignTemplate():', function () {
    it('should set "autoAssignTemplates" property if "AutoAssignTemplateService.getTemplates()" responds with appropriate data', function () {
      initControllerAndAutoAssignFeatureToggleOn.call(this);

      expect(this.controller.autoAssignTemplates).toEqual({
        Default: {
          name: 'Default',
          foo: 'bar',
        },
      });
    });
  });

  describe('isDefaultAutoAssignTemplateActivated():', function () {
    it('should set AutoAssignTemplateModel and be true if has a default template and is activated', function () {
      initControllerAndAutoAssignFeatureToggleOn.call(this);

      expect(this.controller.isDefaultAutoAssignTemplateActivated()).toBe(true);
      expect(this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated).toBe(true);
    });

    it('should set AutoAssignTemplateModel and be false if does not have a default template', function () {
      this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = true; // initial state to check against
      initControllerAndAutoAssignFeatureToggleOn.call(this, {
        getTemplates: this.$q.resolve([]),
      });

      expect(this.controller.isDefaultAutoAssignTemplateActivated()).toBe(false);
      expect(this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated).toBe(false);
    });

    it('should set AutoAssignTemplateModel and be false if is not an activated template', function () {
      this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = true; // initial state to check against
      initControllerAndAutoAssignFeatureToggleOn.call(this, {
        isEnabledForOrg: this.$q.resolve(false),
      });

      expect(this.controller.isDefaultAutoAssignTemplateActivated()).toBe(false);
      expect(this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated).toBe(false);
    });
  });
});
