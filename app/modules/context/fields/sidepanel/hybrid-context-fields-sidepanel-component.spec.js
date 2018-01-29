'use strict';

describe('Component: fields sidepanel', function () {
  var Analytics, ContextFieldsService, ContextFieldsetsService, ModalService, Notification, ctrl, $componentCtrl, $state, $q, $rootScope, field, adminAuthorizationStatus;
  var deleteFieldSpy, membershipReturnSpy, modalSpy;
  var AdminAuthorizationStatus = require('modules/context/services/context-authorization-service').AdminAuthorizationStatus;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Context'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);
  // need to cleanup here to prevent more memory leaks
  afterAll(function () {
    Analytics = ContextFieldsService = ContextFieldsetsService = ModalService = Notification = ctrl = $componentCtrl = $state = $q
      = $rootScope = field = membershipReturnSpy = deleteFieldSpy = modalSpy = adminAuthorizationStatus = undefined;
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
    adminAuthorizationStatus = {};
    ctrl = $componentCtrl('contextFieldsSidepanel', {
      $state: $state,
      Analytics: Analytics,
      ContextFieldsetsService: ContextFieldsetsService,
      ContextFieldsService: ContextFieldsService,
      ModalService: ModalService,
      Notification: Notification,
    }, {
      adminAuthorizationStatus: adminAuthorizationStatus,
      field: field,
    });
  }

  describe('controller', function () {
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
      it('should return false if publically accssible and admin authorized', function () {
        ctrl.publiclyAccessible = true;
        ctrl.inUse = false;
        ctrl.adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
        expect(ctrl.isEditable()).toBe(false);
      });

      it('should return true if in Use and not publically accessible and admin authorized', function () {
        // NOTE: _some_ members of the field are editable
        ctrl.publiclyAccessible = false;
        ctrl.inUse = true;
        ctrl.adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
        expect(ctrl.isEditable()).toBe(true);
      });

      it('should return true if not publically accssible and not in use', function () {
        ctrl.publiclyAccessible = false;
        ctrl.inUse = false;
        ctrl.adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
        expect(ctrl.isEditable()).toBe(true);
      });

      it('should return true if not publically accssible and in use', function () {
        ctrl.publiclyAccessible = false;
        ctrl.inUse = true;
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
      // iterate over combinations if publiclyAccessible and inUse
      [
        {
          publiclyAccessible: true, inUse: false, adminAuthorizationStatus: AdminAuthorizationStatus.UNAUTHORIZED, deletable: false,
        },
        {
          publiclyAccessible: false, inUse: false, adminAuthorizationStatus: AdminAuthorizationStatus.AUTHORIZED, deletable: true,
        },
        {
          publiclyAccessible: true, inUse: true, adminAuthorizationStatus: AdminAuthorizationStatus.UNAUTHORIZED, deletable: false,
        },
        {
          publiclyAccessible: false, inUse: true, adminAuthorizationStatus: AdminAuthorizationStatus.AUTHORIZED, deletable: false,
        },
        {
          publiclyAccessible: false, inUse: false, adminAuthorizationStatus: AdminAuthorizationStatus.UNAUTHORIZED, deletable: false,
        },
      ].forEach(function (testParams) {
        it('should return ' + testParams.deletable + ' if publiclyAccessible is ' + testParams.publiclyAccessible + ',  and adminAuthorizationStatus is ' + testParams.adminAuthorizationStatus + 'and inUse is ' + testParams.inUse, function () {
          ctrl.publiclyAccessible = testParams.publiclyAccessible;
          ctrl.inUse = testParams.inUse;
          ctrl.adminAuthorizationStatus = testParams.adminAuthorizationStatus;
          expect(ctrl.isDeletable()).toBe(testParams.deletable);
        });
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

    describe('getOptionsCount', function () {
      it('should return 0 for empty field', function () {
        expect(ctrl.getOptionCount()).toBe(0);
      });

      it('should return 0 for non-single-select', function () {
        ctrl.field = {
          translations: { english: 'First Name', french: 'Prénom' },
          id: 'aaa_test',
          lastUpdated: '2017-01-26T18:42:42.124Z',
          dataType: 'string',
        };
        expect(ctrl.getOptionCount()).toBe(0);
      });

      it('should return 0 for single-select with invalid dataTypeDefinition', function () {
        ctrl.field = {
          translations: { english: 'First Name', french: 'Prénom' },
          id: 'aaa_test',
          lastUpdated: '2017-01-26T18:42:42.124Z',
          dataType: 'string',
          dataTypeDefinition: {},
        };
        expect(ctrl.getOptionCount()).toBe(0);
      });

      it('should return 0 for single-select with undefined options', function () {
        ctrl.field = {
          translations: { english: 'First Name', french: 'Prénom' },
          id: 'aaa_test',
          lastUpdated: '2017-01-26T18:42:42.124Z',
          dataType: 'atring',
          dataTypeDefinition: {
            type: 'enum',
          },
        };
        expect(ctrl.getOptionCount()).toBe(0);
      });

      it('should return the correct number of options for single-select', function () {
        ctrl.field = {
          translations: { english: 'First Name', french: 'Prénom' },
          id: 'aaa_test',
          lastUpdated: '2017-01-26T18:42:42.124Z',
          dataType: 'string',
          dataTypeDefinition: {
            type: 'enum',
            enumerations: ['1', '2', '3'],
          },
        };
        expect(ctrl.getOptionCount()).toBe(3);
      });
    });

    describe('isDataTypeWithOptions', function () {
      var baseField = {
        publiclyAccessible: false,
        translations: { english: 'First Name', french: 'Prénom' },
        id: 'aaa_test',
        lastUpdated: '2017-01-26T18:42:42.124Z',
        description: 'a description',
        searchable: 'yes',
        type: 'string',
      };

      var baseDataTypeDefinition;

      beforeEach(function () {
        ctrl.field = baseField;

        baseDataTypeDefinition = {
          enumerations: ['a', 'b'],
        };
      });

      ['string', 'integer', 'arbitrary'].forEach(function (type) {
        it('should return false for all types with no dataTypeDefinition: type=' + type, function () {
          ctrl.field.type = type;
          expect(ctrl.isDataTypeWithOptions()).toBe(false);
        });
      });

      ['regex', 'arbitrary'].forEach(function (type) {
        it('should return false for non-option dataTypeDefinitions: type=' + type, function () {
          baseDataTypeDefinition.type = type;
          ctrl.field.dataTypeDefinition = baseDataTypeDefinition;
          expect(ctrl.isDataTypeWithOptions()).toBe(false);
        });
      });

      describe('a proper enum', function () {
        beforeEach(function () {
          baseDataTypeDefinition.type = 'enum';
          ctrl.field.dataTypeDefinition = baseDataTypeDefinition;
        });

        it('should return true when populated', function () {
          expect(ctrl.isDataTypeWithOptions()).toBe(true);
        });

        it('should return true even when empty', function () {
          ctrl.field.dataTypeDefinition.enumerations = [];
          expect(ctrl.isDataTypeWithOptions()).toBe(true);
        });

        it('should return true even when undefined-empty', function () {
          ctrl.field.dataTypeDefinition.enumerations = undefined;
          expect(ctrl.isDataTypeWithOptions()).toBe(true);
        });
      });
    });

    describe('getOptionsSidepanelOptions', function () {
      // just an arbitrary object, there's no validation here
      var dataTypeDefinition = { a: 'a', b: 'b' };
      beforeEach(function () {
        ctrl.field.dataTypeDefinition = _.cloneDeep(dataTypeDefinition);
      });

      it('should return the expected object based on the field', function () {
        ctrl.field.defaultValue = 'defaultValue';
        expect(ctrl.getOptionSidepanelOptions()).toEqual({
          dataTypeDefinition: dataTypeDefinition,
          defaultOption: 'defaultValue',
        });
      });

      it('should return the expected object based on the field with undefined defaultValue', function () {
        expect(ctrl.getOptionSidepanelOptions()).toEqual({
          dataTypeDefinition: dataTypeDefinition,
          defaultOption: undefined,
        });
      });
    });
  });

  /**
   * These tests do not validate the full UI of the feature. Just enough to validate that the feature is <em>present</em>
   * in the UI.
   */
  describe('compile/render component', function () {
    var field = {
      publiclyAccessible: false,
      translations: { english: 'First Name', french: 'Prénom' },
      id: 'aaa_test',
      lastUpdated: '2017-01-26T18:42:42.124Z',
      description: 'a description',
      searchable: 'yes',
      dataType: 'string',
    };

    var adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;

    beforeEach(function () {
      this.injectDependencies(
        '$q',
        'FeatureToggleService'
      );
      this.featureSupportSpy = spyOn(this.FeatureToggleService, 'supports');
      this.featureSupportSpy.and.returnValue(this.$q.resolve(false));
      membershipReturnSpy.and.returnValue(this.$q.resolve([]));
      this.compileComponentNoApply('contextFieldsSidepanel', {
        adminAuthorizationStatus: adminAuthorizationStatus,
        field: field,
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

    describe('edit and delete buttons', function () {
      it('should have edit button', function () {
        this.getController().adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
        this.$scope.$apply();
        expect(this.getController().isEditable()).toBe(true);
        var sectionTitle = this.view.find('section-title');
        // there are 2 of these, but only 1 visible at a time
        expect(sectionTitle.length).toBe(2, 'incorrect number of section-title elements');
        var editableSectionTitle = sectionTitle.first();
        expect(editableSectionTitle).toExist();
        var button = editableSectionTitle.find('.as-button');
        expect(button).toExist('expecting a button here');
        expect(button).toHaveText('common.edit', 'this is likely not the edit button');
      });

      it('should have delete button', function () {
        this.getController().adminAuthorizationStatus = AdminAuthorizationStatus.AUTHORIZED;
        this.$scope.$apply();
        expect(this.getController().isDeletable()).toBe(true);
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

    describe('render in-use field', function () {
      beforeEach(function () {
        membershipReturnSpy.and.returnValue(this.$q.resolve(['A_FIELDSET']));
        this.$scope.$apply();
      });

      it('should STILL have edit button', function () {
        var sectionTitle = this.view.find('section-title');
        // there are 2 of these, but only 1 visible at a time
        expect(sectionTitle.length).toBe(2, 'incorrect number of section-title elements');
        var editableSectionTitle = sectionTitle.first();
        expect(editableSectionTitle).toExist();
        var button = editableSectionTitle.find('.as-button');
        expect(button).toExist('expecting a button here');
        expect(button).toHaveText('common.edit', 'this is likely not the edit button');
      });

      it('should NOT have delete button', function () {
        var containerDiv = this.view.find('cs-sp-container');
        var section = containerDiv.find('cs-sp-section');
        expect(containerDiv.length).toBe(1, 'wrong number of cs-sp-section elements. layout change?');
        var siblings = section.siblings();
        // for now, the delete button is the only sibling, and it doesn't exist if the field is in-use
        if (siblings.length > 0) {
          var deleteButtons = siblings.find('button').find('.btn--delete');
          expect(deleteButtons.length).toBe(0, 'shouldn\'t have found a delete button');
        }
      });
    });

    describe('Options feature for Single Select', function () {
      var fieldToUse;
      beforeEach(function () {
        fieldToUse = {
          publiclyAccessible: false,
          translations: { english: 'First Name', french: 'Prénom' },
          id: 'aaa_test',
          lastUpdated: '2017-01-26T18:42:42.124Z',
          description: 'a description',
          searchable: 'yes',
          dataType: 'string',
          dataTypeUI: 'Single Select',
          dataTypeDefinition: { type: 'enum' },
        };

        membershipReturnSpy.and.returnValue(this.$q.resolve([fieldToUse.id]));

        this.getSectionContent = function () {
          var sectionContent = this.view.find('div.section-content');
          expect(sectionContent).toHaveLength(1);
          return sectionContent;
        };

        this.getFeatures = function () {
          return this.getSectionContent().find('div.feature');
        };

        this.getOptionsLabel = function () {
          return this.getFeatures().find('span.feature-name:contains("context.dictionary.fieldPage.optionsLabel")');
        };
      });

      it('should not show options for non-single-select', function () {
        // compile the default field
        this.$scope.$apply();
        var features = this.getFeatures();
        var featureNames = features.find('span.feature-name');
        expect(featureNames).not.toHaveText('context.dictionary.fieldPage.optionsLabel');
      });

      it('should show options with "none" for single-select with no options', function () {
        // update field to be an empty single select
        this.$scope.field = fieldToUse;
        this.$scope.$apply();
        var optionsLabel = this.getOptionsLabel();
        expect(optionsLabel).toHaveLength(1);
        var siblings = optionsLabel.siblings();
        expect(siblings).toHaveLength(1);
        var status = siblings.first();
        expect(status.is('span')).toBe(true, 'feature status should be a span');
        expect(status).toHaveText('common.none');
        expect(status).toHaveClass('feature-details');
      });

      it('should show options with the correct number for single-select', function () {
        // update the field to be a populated single select
        var enumerations = ['1', '2', '3'];
        var expectedLength = enumerations.length;
        fieldToUse.dataTypeDefinition.enumerations = enumerations;
        this.$scope.field = fieldToUse;
        this.$scope.$apply();
        var features = this.getFeatures();
        // search for expected "options" label
        var options = features.find('span.feature-name:contains("context.dictionary.fieldPage.optionsLabel")');
        expect(options).toHaveLength(1);
        // make sure this is wrapped in an anchor
        var parent = options.parent();
        expect(parent.is('a')).toBe(true, 'parent must be an anchor element');
        // make sure it has the count of items
        var count = parent.find('span.feature-status');
        expect(count).toHaveLength(1);
        expect(count).toHaveText(expectedLength.toString());
        // make sure it has the "feature arrow"
        var arrow = parent.find('i.feature-arrow');
        expect(arrow).toHaveLength(1);
      });
    });
  });
});
