'use strict';

describe('Component: fields sidepanel', function () {

  var ContextFieldsetsService, ctrl, $componentCtrl, $q, $rootScope, field, membershipReturnSpy;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Context'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);
  // need to cleanup here to prevent more memory leaks
  afterAll(function () {
    ContextFieldsetsService = ctrl = $componentCtrl = $q = $rootScope = field = membershipReturnSpy = undefined;
  });

  function dependencies(_ContextFieldsetsService_, _$componentController_, _$q_, _$rootScope_) {
    ContextFieldsetsService = _ContextFieldsetsService_;
    $componentCtrl = _$componentController_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }

  function initSpies() {
    membershipReturnSpy = spyOn(ContextFieldsetsService, 'getFieldMembership').and.returnValue($q.resolve(['id']));
  }

  function initController() {
    field = {};
    ctrl = $componentCtrl('contextFieldsSidepanel', {
      ContextFieldsetsService: ContextFieldsetsService,
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

  describe('fixFieldData', function () {
    it('should default it to true if searchable is a non-string', function () {
      field.searchable = null;
      ctrl._fixFieldData();
      expect(ctrl.searchable).toBe(true);

      field.searchable = undefined;
      ctrl._fixFieldData();
      expect(ctrl.searchable).toBe(true);

      field.searchable = true;
      ctrl._fixFieldData();
      expect(ctrl.searchable).toBe(true);

      field.searchable = false;
      ctrl._fixFieldData();
      expect(ctrl.searchable).toBe(true);
    });

    it('should correctly convert yes to true', function () {
      ['yes', '   yes ', ' YeS', 'YES ', 'YES'].forEach(function (yes) {
        field.searchable = yes;
        ctrl._fixFieldData();
        expect(ctrl.searchable).toBe(true);
      });
    });

    it('should correctly convert anything else to false', function () {
      ['no', '   no ', ' No', 'NO ', 'NO', 'blah', '  foo', 'bar  '].forEach(function (value) {
        field.searchable = value;
        ctrl._fixFieldData();
        expect(ctrl.searchable).toBe(false);
      });
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
});
