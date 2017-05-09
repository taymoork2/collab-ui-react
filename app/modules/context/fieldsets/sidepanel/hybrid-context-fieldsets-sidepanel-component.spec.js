'use strict';

describe('Component: Fieldset SidePanel', function () {

  var $componentCtrl, $q, $rootScope, $state, Analytics, ContextFieldsetsService, ctrl, ModalService, Notification;
  // spies
  var deleteSpy, getInUseSpy, modalSpy;

  var customFieldset = {
    'orgId': 'd06308f8-c24f-4281-8b6f-03f672d34231',
    'description': 'aaa custom fieldset with some description',
    'fields': [
      'AAA_TEST_FIELD',
      'Agent_ID',
      'AAA_TEST_FIELD4',
    ],
    'publiclyAccessible': false,
    'fieldDefinitions': [
      {
        'id': 'AAA_TEST_FIELD',
        'lastUpdated': '2017-02-02T17:12:33.167Z',
      },
      {
        'id': 'AAA_TEST_FIELD4',
        'lastUpdated': '2017-02-02T21:22:35.106Z',
      },
      {
        'id': 'Agent_ID',
        'lastUpdated': '2017-01-23T16:48:50.021Z',
      },
    ],
    'refUrl': '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
    'id': 'aaa_custom_fieldset',
    'lastUpdated': '2017-02-10T19:37:36.998Z',
  };

  var ciscoFieldsetWithNoDescription = {
    'orgId': 'ignored', // don't care
    'fields': [
      'AAA_TEST_FIELD',
      'Agent_ID',
      'AAA_TEST_FIELD4',
    ],
    'publiclyAccessible': true,
    'fieldDefinitions': [
      {
        'id': 'AAA_TEST_FIELD',
        'lastUpdated': '2017-02-02T17:12:33.167Z',
      },
      {
        'id': 'AAA_TEST_FIELD4',
        'lastUpdated': '2017-02-02T21:22:35.106Z',
      },
      {
        'id': 'Agent_ID',
        'lastUpdated': '2017-01-23T16:48:50.021Z',
      },
    ],
    'refUrl': '/dictionary/fieldset/v1/id/aaa_cisco_fieldset',
    'id': 'aaa_cisco_fieldset',
    'lastUpdated': '2017-02-10T19:37:36.998Z',
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Context'));

  // need to cleanup here to prevent more memory leaks
  afterAll(function () {
    Analytics = ContextFieldsetsService = ModalService = Notification = ctrl = $componentCtrl = $q = $rootScope = $state = undefined;
  });

  function dependencies(_$componentController_, _$q_, _$rootScope_, _$state_, _Analytics_,
    _ContextFieldsetsService_, _ModalService_, _Notification_) {
    $componentCtrl = _$componentController_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    Analytics = _Analytics_;
    ContextFieldsetsService = _ContextFieldsetsService_;
    ModalService = _ModalService_;
    Notification = _Notification_;
  }

  function initCustomController() {
    return initController(customFieldset);
  }

  function initController(fieldset) {
    ctrl = $componentCtrl('contextFieldsetsSidepanel', {
      $state: $state,
      Analytics: Analytics,
      ContextFielsetsService: ContextFieldsetsService,
      ModalService: ModalService,
      Notification: Notification,
    }, {
      fieldset: fieldset,
    });
    ctrl.$onInit();
  }

  function initSpies() {
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Analytics, 'trackEvent');
    spyOn($state, 'go');
    deleteSpy = spyOn(ContextFieldsetsService, 'deleteFieldset');
    getInUseSpy = spyOn(ContextFieldsetsService, 'getInUse');
    modalSpy = spyOn(ModalService, 'open');
  }

  describe('initController', function () {

    beforeEach(inject(dependencies));
    beforeEach(initSpies);

    it('should have fieldset id, description, field list and lastupdated date', function () {
      getInUseSpy.and.returnValue($q.resolve(false));
      initCustomController();
      $rootScope.$apply();

      expect(ContextFieldsetsService.getInUse).toHaveBeenCalledWith(customFieldset.id);
      expect(ctrl.lastUpdated).not.toBeNull();
      expect(ctrl.fields.length).toBe(3);
      expect(ctrl.fieldset.id).toEqual(customFieldset.id);
      expect(ctrl.fieldset.description).toEqual('aaa custom fieldset with some description');
      expect(ctrl.inUse).toBe(false);
      expect(ctrl.publiclyAccessible).toBe(false);
      expect(ctrl.hasDescription).toBe(true);
      expect(ctrl.isEditable()).toBe(true);
    });

    it('should be in use', function () {
      getInUseSpy.and.returnValue($q.resolve(true));
      initCustomController();
      $rootScope.$apply();

      expect(ContextFieldsetsService.getInUse).toHaveBeenCalledWith(customFieldset.id);
      expect(ctrl.fieldset.id).toEqual(customFieldset.id);
      expect(ctrl.inUse).toBe(true);
      expect(ctrl.isEditable()).toBe(false);
    });

    it('is a Cisco fieldset with no description', function () {
      getInUseSpy.and.returnValue($q.resolve(false));
      initController(ciscoFieldsetWithNoDescription);
      $rootScope.$apply();

      expect(ContextFieldsetsService.getInUse).toHaveBeenCalledWith(ciscoFieldsetWithNoDescription.id);
      expect(ctrl.lastUpdated).not.toBeNull();
      expect(ctrl.fields.length).toBe(3);
      expect(ctrl.fieldset.id).toEqual(ciscoFieldsetWithNoDescription.id);
      expect(ctrl.fieldset.description).toEqual(undefined);
      expect(ctrl.inUse).toBe(false);
      expect(ctrl.publiclyAccessible).toBe(true);
      expect(ctrl.hasDescription).toBe(false);
      expect(ctrl.isEditable()).toBe(false);
    });
  });

  describe('isEditable', function () {
    it('should return false if publicly accessible', function () {
      ctrl.publiclyAccessible = true;
      ctrl.inUse = false;
      expect(ctrl.isEditable()).toBe(false);
    });

    it('should return false if in Use', function () {
      ctrl.publiclyAccessible = false;
      ctrl.inUse = true;
      expect(ctrl.isEditable()).toBe(false);
    });

    it('should return true if not publicly accessible and not in use', function () {
      ctrl.publiclyAccessible = false;
      ctrl.inUse = false;
      expect(ctrl.isEditable()).toBe(true);
    });
  });

  describe('openDeleteConfirmDialog', function () {

    beforeEach(inject(dependencies));
    beforeEach(initSpies);
    beforeEach(function () {
      getInUseSpy.and.returnValue($q.resolve(false));
    });
    beforeEach(initCustomController);

    it('should open and cancel the dialog', function () {
      modalSpy.and.returnValue({ result: $q.reject() });
      ctrl.openDeleteConfirmDialog();
      $rootScope.$apply();

      expect(ModalService.open).toHaveBeenCalled();
      expect(ContextFieldsetsService.deleteFieldset).not.toHaveBeenCalled();
      expect(Notification.error).not.toHaveBeenCalled();
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
      expect($state.go).not.toHaveBeenCalled();
    });

    it('should open the dialog and confirm', function () {
      modalSpy.and.returnValue({ result: $q.resolve() });
      deleteSpy.and.returnValue($q.resolve());
      ctrl.openDeleteConfirmDialog();
      $rootScope.$apply();

      expect(ModalService.open).toHaveBeenCalled();
      expect(ContextFieldsetsService.deleteFieldset).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalled();
      expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.CONTEXT.eventNames.CONTEXT_DELETE_FIELDSET_SUCCESS);
      expect($state.go).toHaveBeenCalledWith('context-fieldsets');
    });

    it('should open the dialog, confirm and fail delete', function () {
      modalSpy.and.returnValue({ result: $q.resolve() });
      deleteSpy.and.returnValue($q.reject('error'));
      ctrl.openDeleteConfirmDialog();
      $rootScope.$apply();

      expect(ModalService.open).toHaveBeenCalled();
      expect(ContextFieldsetsService.deleteFieldset).toHaveBeenCalled();
      expect(Notification.error).toHaveBeenCalled();
      expect(Analytics.trackEvent).toHaveBeenCalledWith(Analytics.sections.CONTEXT.eventNames.CONTEXT_DELETE_FIELDSET_FAILURE);
      expect($state.go).not.toHaveBeenCalled();
    });
  });
});
