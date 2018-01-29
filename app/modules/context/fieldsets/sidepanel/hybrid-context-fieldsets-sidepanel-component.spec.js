'use strict';

describe('Component: Fieldset SidePanel', function () {
  var customFieldset = {
    orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
    description: 'aaa custom fieldset with some description',
    fields: [
      'AAA_TEST_FIELD',
      'Agent_ID',
      'AAA_TEST_FIELD4',
    ],
    publiclyAccessible: false,
    fieldDefinitions: [
      { id: 'AAA_TEST_FIELD', lastUpdated: '2017-02-02T17:12:33.167Z' },
      { id: 'AAA_TEST_FIELD4', lastUpdated: '2017-02-02T21:22:35.106Z' },
      { id: 'Agent_ID', lastUpdated: '2017-01-23T16:48:50.021Z' },
    ],
    refUrl: '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
    id: 'aaa_custom_fieldset',
    lastUpdated: '2017-02-10T19:37:36.998Z',
  };

  var customFieldsetWithInactiveFields = {
    orgId: 'd06308f8-c24f-4281-8b6f-03f672d34231',
    description: 'custom fieldset with inactive fields',
    fields: [
      'AAA_TEST_FIELD',
      'Agent_ID',
      'AAA_TEST_FIELD4',
      'INACTIVE_FIELD1',
      'INACTIVE_FIELD2',
    ],
    inactiveFields: [
      'INACTIVE_FIELD1',
      'INACTIVE_FIELD2',
    ],
    publiclyAccessible: false,
    fieldDefinitions: [
      { id: 'AAA_TEST_FIELD', lastUpdated: '2017-02-02T17:12:33.167Z' },
      { id: 'AAA_TEST_FIELD4', lastUpdated: '2017-02-02T21:22:35.106Z' },
      { id: 'Agent_ID', lastUpdated: '2017-01-23T16:48:50.021Z' },
      { id: 'INACTIVE_FIELD1', lastUpdated: '2017-01-23T16:48:50.021Z' },
      { id: 'INACTIVE_FIELD2', lastUpdated: '2017-01-23T16:48:50.021Z' },
    ],
    refUrl: '/dictionary/fieldset/v1/id/custom_fieldset_with_inactive_fields',
    id: 'custom_fieldset_with_inactive_fields',
    lastUpdated: '2017-02-10T19:37:36.998Z',
  };

  var ciscoFieldsetWithNoDescription = {
    orgId: 'ignored', // don't care
    fields: [
      'AAA_TEST_FIELD',
      'Agent_ID',
      'AAA_TEST_FIELD4',
    ],
    publiclyAccessible: true,
    fieldDefinitions: [
      { id: 'AAA_TEST_FIELD', lastUpdated: '2017-02-02T17:12:33.167Z' },
      { id: 'AAA_TEST_FIELD4', lastUpdated: '2017-02-02T21:22:35.106Z' },
      { id: 'Agent_ID', lastUpdated: '2017-01-23T16:48:50.021Z' },
    ],
    refUrl: '/dictionary/fieldset/v1/id/aaa_cisco_fieldset',
    id: 'aaa_cisco_fieldset',
    lastUpdated: '2017-02-10T19:37:36.998Z',
  };

  var AdminAuthorizationStatus = require('modules/context/services/context-authorization-service').AdminAuthorizationStatus;
  var adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;

  describe('controller tests', function () {
    var $componentCtrl, $q, $rootScope, $state, Analytics, ContextFieldsetsService, ctrl, ModalService, Notification;
    // spies
    var deleteSpy, getInUseSpy, modalSpy;

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
        adminAuthorizationStatus: adminAuthorizationStatus,
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
        expect(ctrl.isEditable()).toBe(true);
      });

      it('should be a Cisco fieldset with no description', function () {
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

      it('should be a Custom fieldset with inactive fields', function () {
        getInUseSpy.and.returnValue($q.resolve(false));
        initController(customFieldsetWithInactiveFields);
        $rootScope.$apply();

        expect(ContextFieldsetsService.getInUse).toHaveBeenCalledWith(customFieldsetWithInactiveFields.id);
        expect(ctrl.lastUpdated).not.toBeNull();
        expect(ctrl.fields.length).toBe(3); // Total fields (5) - Inactive fields (2) = 3
        expect(ctrl.fieldset.id).toEqual(customFieldsetWithInactiveFields.id);
        expect(ctrl.fieldset.description).toEqual('custom fieldset with inactive fields');
        expect(ctrl.inUse).toBe(false);
        expect(ctrl.publiclyAccessible).toBe(false);
        expect(ctrl.hasDescription).toBe(true);
        expect(ctrl.isEditable()).toBe(true);
      });
    });

    describe('isEditable', function () {
      it('should return false if publicly accessible and admin authorized', function () {
        ctrl.publiclyAccessible = true;
        ctrl.adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
        expect(ctrl.isEditable()).toBe(false);
      });

      it('should return true if it is not publicly accessible and admin authorized', function () {
        ctrl.publiclyAccessible = false;
        ctrl.adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
        expect(ctrl.isEditable()).toBe(true);
      });

      it('should return false if it is publicly accessible and admin not authorized', function () {
        ctrl.publiclyAccessible = true;
        ctrl.adminAuthorizationStatus = AdminAuthorizationStatus.UNAUTHORIZED;
        expect(ctrl.isEditable()).toBe(false);
      });

      it('should return false if it is not publicly accessible and admin not authorized', function () {
        ctrl.publiclyAccessible = false;
        ctrl.adminAuthorizationStatus = AdminAuthorizationStatus.UNAUTHORIZED;
        expect(ctrl.isEditable()).toBe(false);
      });
    });
    describe('isDeletable', function () {
      it('should return false if publicly accessible', function () {
        ctrl.publiclyAccessible = true;
        ctrl.inUse = false;
        ctrl.adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
        expect(ctrl.isDeletable()).toBe(false);
      });

      it('should return false if in Use', function () {
        ctrl.publiclyAccessible = false;
        ctrl.inUse = true;
        ctrl.adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
        expect(ctrl.isDeletable()).toBe(false);
      });

      it('should return true if not publicly accessible and not in use', function () {
        ctrl.publiclyAccessible = false;
        ctrl.inUse = false;
        ctrl.adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
        expect(ctrl.isDeletable()).toBe(true);
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
        expect(Notification.error).toHaveBeenCalled();
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

  /**
   * These tests do not validate the full UI of the feature. Just enough to validate that the feature is <em>present</em>
   * in the UI.
   */
  describe('fieldset-edit feature is present', function () {
    beforeEach(function () {
      this.initModules('Core', 'Context');
      this.injectDependencies(
        '$q',
        'ContextFieldsetsService',
        'FeatureToggleService'
      );

      this.getInUseSpy = spyOn(this.ContextFieldsetsService, 'getInUse');
      this.getInUseSpy.and.returnValue(this.$q.resolve(false));
      this.featureSupportSpy = spyOn(this.FeatureToggleService, 'supports');
      this.featureSupportSpy.and.returnValue(this.$q.resolve(false));

      this.compileComponentNoApply('contextFieldsetsSidepanel', {
        fieldset: customFieldset,
        adminAuthorizationStatus: AdminAuthorizationStatus.AUTHORIZED,
      });

      this.getController = function () {
        var controller = this.controller;
        if (controller === undefined) {
          var viewNode = this.view[0];
          expect(viewNode).toHaveLength(1);
          var componentName = viewNode.localName;
          componentName = _.camelCase(componentName);
          controller = this.view.controller(componentName);
          this.controller = controller;
        }
        return controller;
      };
    });

    afterEach(function () {
      // NOTE: these tests can probably be removed with the next story. We only need to temporarily validate to ensure
      // these feature flags are not being checked when compiling the component
      expect(this.featureSupportSpy).not.toHaveBeenCalledWith('contact-center-context');
      expect(this.featureSupportSpy).not.toHaveBeenCalledWith('atlas-context-dictionary-edit');
    });

    it('should have edit button', function () {
      this.getController().adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
      this.$scope.$apply();
      var sectionTitle = this.view.find('section-title');
      // there are 2 of these, but only 1 visible at a time
      expect(sectionTitle.length).toBe(2, 'incorrect number of section-title elements');
      var editableSectionTitle = sectionTitle.first();
      expect(editableSectionTitle).toExist();
      var button = editableSectionTitle.find('.as-button');
      expect(button).toExist();
      expect(button).toHaveText('common.edit', 'this likely not the edit button');
    });

    it('should have delete button', function () {
      this.getController().adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
      this.$scope.$apply();
      var containerDiv = this.view.find('cs-sp-container');
      var section = containerDiv.find('cs-sp-section');
      expect(containerDiv.length).toBe(1, 'wrong number of cs-sp-section elements. layout change?');
      var siblings = section.siblings();
      // for now, there are two children, and the delete button is the second(last)
      expect(siblings.length).toBe(1, 'incorrect number of expected cs-sp-section siblings -- button(s)');
      var button = siblings.get(0);
      expect(button.tagName).toBe('BUTTON', 'expecting a button to be here');
      button = $(button);
      expect(button).toHaveClass('btn--delete', 'this is likely not the delete button');
    });
  });
});
