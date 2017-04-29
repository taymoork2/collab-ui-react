'use strict';

describe('Component: fields sidepanel', function () {

  var Analytics, ContextFieldsService, ContextFieldsetsService, ModalService, Notification, ctrl, $componentCtrl, $state, $q, $rootScope, field;
  var deleteFieldSpy, membershipReturnSpy, modalSpy;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Context'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);
  // need to cleanup here to prevent more memory leaks
  afterAll(function () {
    Analytics = ContextFieldsService = ContextFieldsetsService = ModalService = Notification = ctrl = $componentCtrl = $state = $q
      = $rootScope = field = membershipReturnSpy = deleteFieldSpy = modalSpy = undefined;
  });

  function dependencies(_$componentController_, _$rootScope_, _$state_, _$q_, _Analytics_, _ContextFieldsService_, _ContextFieldsetsService_, _ModalService_, _Notification_) {
    $componentCtrl = _$componentController_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    $q = _$q_;
    Analytics = _Analytics_;
    ContextFieldsService = _ContextFieldsService_;
    ContextFieldsetsService = _ContextFieldsetsService_;
    ModalService = _ModalService_;
    Notification = _Notification_;
  }

  function initSpies() {
    membershipReturnSpy = spyOn(ContextFieldsetsService, 'getFieldMembership').and.returnValue($q.resolve(['id']));
    deleteFieldSpy = spyOn(ContextFieldsService, 'deleteField').and.returnValue($q.resolve());
    modalSpy = spyOn(ModalService, 'open');
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Analytics, 'trackEvent');
    spyOn($state, 'go');
    // default spy behaviors
    modalSpy.and.returnValue({ result: $q.resolve() });
  }

  function initController() {
    field = {};
    ctrl = $componentCtrl('contextFieldsSidepanel', {
      $state: $state,
      Analytics: Analytics,
      ContextFieldsetsService: ContextFieldsetsService,
      ContextFieldsService: ContextFieldsService,
      ModalService: ModalService,
      Notification: Notification,
    }, {
      field: field,
    });
  }

  describe('getLabelLength', function () {
    it('should return 0 for non-objects', function () {
      field.translations = undefined;
      expect(ctrl.getLabelLength()).toBe(0);

      field.translations = null;
      expect(ctrl.getLabelLength()).toBe(0);

      field.translations = 'blah';
      expect(ctrl.getLabelLength()).toBe(0);
    });

    it('should return the correct length', function () {
      field.translations = {};
      expect(ctrl.getLabelLength()).toBe(0);

      field.translations = {
        foo: 'bar',
        hello: 'world',
      };
      expect(ctrl.getLabelLength()).toBe(2);
    });
  });

  describe('getAssociatedFieldsets', function () {
    it('should set fetchFailure to true when error occurs', function (done) {
      membershipReturnSpy.and.returnValue($q.reject('error'));
      ctrl._getAssociatedFieldsets()
        .then(function () {
          expect(ctrl.fetchInProgress).toBe(false);
          expect(ctrl.fetchFailure).toBe(true);
          done();
        }).catch(done.fail);
      $rootScope.$apply();
    });

    it('should set fetchFailure to false and save list of ids', function (done) {
      ctrl._getAssociatedFieldsets()
        .then(function () {
          expect(ctrl.fetchInProgress).toBe(false);
          expect(ctrl.fetchFailure).toBe(false);
          expect(ctrl.associatedFieldsets).toEqual(['id']);
          done();
        }).catch(done.fail);
      $rootScope.$apply();
    });
  });

  describe('isEditable', function () {
    it('should return false if publically accssible', function () {
      ctrl.publiclyAccessible = true;
      ctrl.inUse = false;
      expect(ctrl.isEditable()).toBe(false);
    });
    it('should return false if in Use', function () {
      ctrl.publiclyAccessible = false;
      ctrl.inUse = true;
      expect(ctrl.isEditable()).toBe(false);
    });
    it('should return true if not publically accssible and not in use', function () {
      ctrl.publiclyAccessible = false;
      ctrl.inUse = false;
      expect(ctrl.isEditable()).toBe(true);
    });
  });

  describe('openDeleteConfirmDialog', function () {
    it('should open the modal dialog', function () {
      modalSpy.and.returnValue({ result: $q.reject() });
      ctrl.openDeleteConfirmDialog();
      $rootScope.$apply();

      expect(ModalService.open).toHaveBeenCalled();
      expect(ContextFieldsService.deleteField).not.toHaveBeenCalled();
      expect(Notification.error).not.toHaveBeenCalled();
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
      expect($state.go).not.toHaveBeenCalled();
    });

    it('should successfully delete a field, show success notification and update analytics', function () {
      ctrl.openDeleteConfirmDialog();
      $rootScope.$apply();

      expect(ModalService.open).toHaveBeenCalled();
      expect(ContextFieldsService.deleteField).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalledWith('context.dictionary.fieldPage.fieldDeleteSuccess');
      expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.CONTEXT.eventNames.CONTEXT_DELETE_FIELD_SUCCESS);
      expect($state.go).toHaveBeenCalledWith('context-fields');
    });

    it('should show the error notification and update analytics on failure to delete a field', function () {
      deleteFieldSpy.and.returnValue($q.reject('error'));
      ctrl.openDeleteConfirmDialog();
      $rootScope.$apply();

      expect(ModalService.open).toHaveBeenCalled();
      expect(ContextFieldsService.deleteField).toHaveBeenCalled();
      expect(Notification.error).toHaveBeenCalledWith('context.dictionary.fieldPage.fieldDeleteFailure');
      expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.CONTEXT.eventNames.CONTEXT_DELETE_FIELD_FAILURE);
      expect($state.go).not.toHaveBeenCalled();
    });
  });
});
