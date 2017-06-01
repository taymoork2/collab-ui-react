'use strict';

describe('Component: cbgNotes', function () {
  var $q, $state, $scope, $componentCtrl;
  var ctrl, cbgService, Notification, PreviousState, $httpBackend, UrlConfig;
  var preData = getJSONFixture('gemini/common.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    $q = $state = $httpBackend = UrlConfig = $scope = $componentCtrl = ctrl = cbgService = Notification = PreviousState = undefined;
  });
  afterAll(function () {
    preData = undefined;
  });

  function dependencies(_$q_, _$state_, _$httpBackend_, _UrlConfig_, _$rootScope_, _$componentController_, _Notification_, _cbgService_, _PreviousState_) {
    $q = _$q_;
    $state = _$state_;
    cbgService = _cbgService_;
    $scope = _$rootScope_.$new();
    Notification = _Notification_;
    PreviousState = _PreviousState_;
    $componentCtrl = _$componentController_;
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
  }

  function initSpies() {
    spyOn(PreviousState, 'go');
    spyOn(Notification, 'notify');
    spyOn(Notification, 'error');
    spyOn(cbgService, 'getNotes').and.returnValue($q.resolve());
    spyOn(cbgService, 'postNote').and.returnValue($q.resolve());
  }

  function initController() {
    $state.current.data = {};

    var getCountriesUrl = UrlConfig.getGeminiUrl() + 'countries';
    $httpBackend.expectGET(getCountriesUrl).respond(200, preData.getCountries);

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
      expect(ctrl.notes.length).toBe(5);
    });

    it('failed to add note when the note is too long', function () {
      var getNotesResponse = preData.common;
      ctrl.model = {};
      ctrl.allNotes = preData.getNotes.splice(0, 3);
      ctrl.model.postData = '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';
      getNotesResponse.content.data.body = {};
      ctrl.onSave();
      $scope.$apply();
      expect(Notification.error).toHaveBeenCalled();
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
