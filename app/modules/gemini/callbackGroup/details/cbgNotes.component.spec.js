'use strict';

describe('Component: cbgNotes', function () {
  var $q, $state, $scope, $componentCtrl;
  var ctrl, cbgService, Notification, PreviousState;
  var preData = getJSONFixture('gemini/common.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    $q = $state = $scope = $componentCtrl = ctrl = cbgService = Notification = PreviousState = undefined;
  });
  afterAll(function () {
    preData = undefined;
  });

  function dependencies(_$q_, _$state_, _$rootScope_, _$componentController_, _Notification_, _cbgService_, _PreviousState_) {
    $q = _$q_;
    $state = _$state_;
    cbgService = _cbgService_;
    $scope = _$rootScope_.$new();
    Notification = _Notification_;
    PreviousState = _PreviousState_;
    $componentCtrl = _$componentController_;
  }

  function initSpies() {
    spyOn(PreviousState, 'go');
    spyOn(Notification, 'notify');
    spyOn(cbgService, 'getNotes').and.returnValue($q.resolve());
    spyOn(cbgService, 'postNote').and.returnValue($q.resolve());
  }

  function initController() {
    $state.current.data = {};
    ctrl = $componentCtrl('cbgNotes', { $scope: $scope, $state: $state });
  }

  describe('$onInit', function () {
    it('should get correct notes', function () {
      var getNotesResponse = preData.common;
      getNotesResponse.content.data.returnCode = 0;
      getNotesResponse.content.data.body = preData.getNotes;
      cbgService.getNotes.and.returnValue($q.resolve(getNotesResponse));
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.loading).toBe(false);
    });

    it('should get notes', function () {
      var getNotesResponse = preData.common;
      getNotesResponse.content.data.returnCode = 1000;
      cbgService.getNotes.and.returnValue($q.resolve(getNotesResponse));
      ctrl.$onInit();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalled();
    });
  });

  describe('click event', function () {
    it('should isShowAll in onShowAll', function () {
      ctrl.onShowAll();
      $scope.$apply();
      expect(ctrl.isShowAll).toBe(false);
    });

    it('should call PreviousState.go in onCancel', function () {
      ctrl.onCancel();
      $scope.$apply();
      expect(PreviousState.go).toHaveBeenCalled();
    });

    it('should add a new data in onSave', function () {
      var getNotesResponse = preData.common;
      ctrl.model = {};
      ctrl.allNotes = preData.getNotes;
      ctrl.model.postData = 'Add another note';
      getNotesResponse.content.data.body = {};
      cbgService.postNote.and.returnValue($q.resolve(getNotesResponse));
      ctrl.onSave();
      $scope.$apply();
      expect(ctrl.notes.length).toBe(3);
    });

    it('should call Notification.error in onSave', function () {
      var getNotesResponse = preData.common;
      ctrl.model = {};
      ctrl.model.postData = 'Add another note';
      getNotesResponse.content.data.body = {};
      getNotesResponse.content.data.body.returnCode = 1000;
      cbgService.postNote.and.returnValue($q.resolve(getNotesResponse));
      ctrl.onSave();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalled();
    });
  });
});
