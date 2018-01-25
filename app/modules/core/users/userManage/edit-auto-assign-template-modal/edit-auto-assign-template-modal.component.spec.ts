import moduleName from './index';

describe('Component: editAutoAssignTemplateModal:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      '$scope',
      '$state',
      'Analytics',
      'AutoAssignTemplateService',
    );
    this.autoAssignTemplateData = {};
    this.$scope.dismiss = _.noop;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('primary behaviors (view):', () => {
    beforeEach(function () {
      spyOn(this.AutoAssignTemplateService, 'getSortedSubscriptions').and.returnValue(this.$q.resolve([]));
      this.compileTemplate('<edit-auto-assign-template-modal dismiss="_.noop()"></edit-auto-assign-template-modal>');
    });

    it('should always render a title, a header, a description, and a tooltip', function () {
      expect(this.view.find('.modal-header > h3[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.title');
      expect(this.view.find('.modal-body > h4[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.header');
      expect(this.view.find('.modal-body > p[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.description');
      expect(this.view.find('.modal-body > p > span[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.note');
      expect(this.view.find('.modal-body > p > a > i.icon-info[tooltip="userManage.autoAssignTemplate.edit.tooltip"]').length).toBe(1);
    });

    it('should always render a back and a next button', function () {
      expect(this.view.find('button.btn.back').length).toBe(1);
      expect(this.view.find('button.btn.next').length).toBe(1);
    });

    it('should render render an "assignable-services" element', function () {
      expect(this.view.find('assignable-services[subscriptions]').length).toBe(1);
      expect(this.view.find('assignable-services[on-update]').length).toBe(1);
      expect(this.view.find('assignable-services[auto-assign-template-data]').length).toBe(1);
    });
  });

  describe('primary behaviors (controller):', () => {
    beforeEach(function () {
      spyOn(this.$state, 'go');
      _.set(this.autoAssignTemplateData, 'subscriptions', []);
      spyOn(this.Analytics, 'trackAddUsers');
      spyOn(this.AutoAssignTemplateService, 'getSortedSubscriptions').and.returnValue(this.$q.resolve([]));
      this.compileComponent('editAutoAssignTemplateModal', {
        prevState: 'fake-previous-state',
        isEditTemplateMode: true,
        autoAssignTemplateData: this.autoAssignTemplateData,
        dismiss: 'dismiss',
      });
    });

    it('should navigate to previous state when back button is clicked', function () {
      this.view.find('button.btn.back').click();
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.picker');
    });

    it('should navigate to the next state when next button is clicked', function () {
      this.view.find('button.btn.next').click();
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.edit-summary-auto-assign-template-modal', {
        autoAssignTemplateData: this.autoAssignTemplateData,
        isEditTemplateMode: true,
      });
    });

    it('should track the event when the modal is dismissed', function () {
      this.view.find('button.close[aria-label="common.close"]').click();
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
    });
  });
});
