import moduleName from './index';

describe('Component: autoAssignTemplateManageOptions:', () => {
  enum Options {
    MODIFY = 'a[translate="userManage.org.moreOptions.modifyAutoAssign"]',
    ACTIVATE = 'a[translate="userManage.org.moreOptions.activateAutoAssign"]',
    DEACTIVATE = 'a[translate="userManage.org.moreOptions.deactivateAutoAssign"]',
    DELETE = 'a[translate="userManage.org.moreOptions.deleteAutoAssign"]',
  }
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      'AutoAssignTemplateService',
      'ModalService',
      'Notification',
    );
    this.$scope.onActivateToggleSpy = jasmine.createSpy('onActivateToggle');
    this.$scope.onDeleteSpy = jasmine.createSpy('onDelete');
    this.$scope.autoAssignTemplates = {
      Default: {
        templateId: 'fake-template-id',
      },
    };
    this.$scope.onDelete = _.noop;
    this.autoAssignTemplateData = {};
    _.set(this.autoAssignTemplateData, 'LICENSE', {});
    _.set(this.autoAssignTemplateData, 'USER_ENTITLEMENTS_PAYLOAD', undefined);
  });

  beforeEach(function () {
    this.compileComponent('autoAssignTemplateManageOptions', {
      autoAssignTemplates: {
        Default: {
          templateId: 'fake-template-id',
        },
      },
      isTemplateActive: false,
      onActivateToggle: 'onActivateToggleSpy(isActivated)',
      onDelete: 'onDeleteSpy()',
    });
  });

  describe('primary behaviors (view):', () => {
    it('should render a toggle button, a drop-down menu, and three menu items', function () {
      expect(this.view.find('button[cs-dropdown-toggle]')).toExist();
      expect(this.view.find('ul[cs-dropdown-menu]')).toExist();
      expect(this.view.find('li').length).toBe(3);
      expect(this.view.find(Options.MODIFY)).toExist();
      expect(this.view.find(Options.ACTIVATE)).toExist();
      expect(this.view.find(Options.DEACTIVATE)).not.toExist();
      expect(this.view.find(Options.DELETE)).toExist();

      // change isTemplateActive input to true
      this.$scope.isTemplateActive = true;
      this.$scope.$apply();

      // verify that Activate switches to Deactivate
      expect(this.view.find(Options.ACTIVATE)).not.toExist();
      expect(this.view.find(Options.DEACTIVATE)).toExist();
    });
  });

  it('should call deleteAutoAssignTemplate() successfully', function () {
    spyOn(this.ModalService, 'open').and.returnValue({
      result: this.$q.resolve(true),
    });
    spyOn(this.AutoAssignTemplateService, 'deleteTemplate').and.returnValue(this.$q.resolve());
    spyOn(this.Notification, 'success');

    this.view.find(Options.DELETE).click();
    expect(this.AutoAssignTemplateService.deleteTemplate).toHaveBeenCalledWith('fake-template-id');
    expect(this.Notification.success).toHaveBeenCalledWith('userManage.org.deleteAutoAssignModal.deleteSuccess');
    expect(this.$scope.onDeleteSpy).toHaveBeenCalled();
  });

  it('should call activateAutoAssignTemplate() successfully', function () {
    spyOn(this.AutoAssignTemplateService, 'activateTemplate').and.returnValue(this.$q.resolve());
    spyOn(this.Notification, 'success');

    this.view.find(Options.ACTIVATE).click();
    expect(this.$scope.onActivateToggleSpy).toHaveBeenCalledWith(true);
    expect(this.Notification.success).toHaveBeenCalledWith('userManage.org.activateAutoAssign.activateSuccess');
  });

  it('should call deactivateAutoAssignTemplate() successfully', function () {
    spyOn(this.ModalService, 'open').and.returnValue({
      result: this.$q.resolve(true),
    });
    spyOn(this.AutoAssignTemplateService, 'deactivateTemplate').and.returnValue(this.$q.resolve());
    spyOn(this.Notification, 'success');

    // change isTemplateActive input to true
    this.$scope.isTemplateActive = true;
    this.$scope.$apply();

    this.view.find(Options.DEACTIVATE).click();
    expect(this.$scope.onActivateToggleSpy).toHaveBeenCalledWith(false);
    expect(this.Notification.success).toHaveBeenCalledWith('userManage.org.deactivateAutoAssign.deactivateSuccess');
  });
});
