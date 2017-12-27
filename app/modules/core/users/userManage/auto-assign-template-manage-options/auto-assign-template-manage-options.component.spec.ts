import moduleName from './index';

describe('Component: autoAssignTemplateManageOptions:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
      'AutoAssignTemplateService',
      'ModalService',
      'Notification',
    );
    this.$scope.autoAssignTemplates = {
      Default: {
        templateId: 'fake-template-id',
      },
    };
    this.$scope.onDelete = _.noop;
  });

  // TODO: use as-appropriate
  beforeEach(function () {
    this.compileComponent('autoAssignTemplateManageOptions', {
      autoAssignTemplates: 'autoAssignTemplates',
      onActivateToggle: 'onActivateToggle',
      onDelete: 'onDelete',
    });
  });

  describe('primary behaviors (view):', () => {
    it('should render a toggle button, a drop-down menu, and three menu items', function () {
      expect(this.view.find('button[cs-dropdown-toggle]').length).toBe(1);
      expect(this.view.find('ul[cs-dropdown-menu]').length).toBe(1);
      expect(this.view.find('li.menu-item').length).toBe(3);
      expect(this.view.find('a[translate="userManage.org.moreOptions.modifyAutoAssign"]').length).toBe(1);
      expect(this.view.find('a[translate="userManage.org.moreOptions.activateAutoAssign"]').length).toBe(1);
      expect(this.view.find('a[translate="userManage.org.moreOptions.deleteAutoAssign"]').length).toBe(1);
    });
  });

  describe('primary behaviors (controller):', () => {
    it('...', function () {
      spyOn(this.ModalService, 'open').and.returnValue({
        result: this.$q.resolve(true),
      });
      spyOn(this.AutoAssignTemplateService, 'deleteTemplate').and.returnValue(this.$q.resolve());
      spyOn(this.Notification, 'success');
      spyOn(this.controller, 'onDelete');
      this.controller.deleteAutoAssignTemplate();
      this.$scope.$apply();
      expect(this.AutoAssignTemplateService.deleteTemplate).toHaveBeenCalledWith('fake-template-id');
      expect(this.Notification.success).toHaveBeenCalledWith('userManage.org.deleteAutoAssignModal.deleteSuccess');
      expect(this.controller.onDelete).toHaveBeenCalled();
    });

    it('should call activateAutoAssignTemplate successfully', function () {
      spyOn(this.AutoAssignTemplateService, 'activateTemplate').and.returnValue(this.$q.resolve());
      spyOn(this.controller, 'onActivateToggle');
      spyOn(this.Notification, 'success');
      this.controller.activateAutoAssignTemplate();
      this.$scope.$apply();
      expect(this.controller.isActivated).toBe(true);
      expect(this.controller.onActivateToggle).toHaveBeenCalledWith({ isActivated: this.controller.isActivated });
      expect(this.Notification.success).toHaveBeenCalledWith('userManage.org.activateAutoAssign.activateSuccess');
    });

    it('should call deactivateAutoAssignTemplate successfully', function () {
      spyOn(this.ModalService, 'open').and.returnValue({
        result: this.$q.resolve(true),
      });
      spyOn(this.AutoAssignTemplateService, 'deactivateTemplate').and.returnValue(this.$q.resolve());
      spyOn(this.controller, 'onActivateToggle');
      spyOn(this.Notification, 'success');
      this.controller.deactivateAutoAssignTemplate();
      this.$scope.$apply();
      expect(this.controller.isActivated).toBe(false);
      expect(this.controller.onActivateToggle).toHaveBeenCalledWith({ isActivated: this.controller.isActivated });
      expect(this.Notification.success).toHaveBeenCalledWith('userManage.org.deactivateAutoAssign.deactivateSuccess');
    });
  });
});
