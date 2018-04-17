'use strict';

describe('Component: CbgDetails', function () {
  var $q, $state, $modal, $scope, $stateParams, $window, $componentCtrl, $httpBackend;
  var obj, ctrl, cbgService, gemService, Notification, UrlConfig;

  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    $q = $state = $httpBackend = UrlConfig = $modal = $scope = $stateParams = $window = $componentCtrl = obj = ctrl = cbgService = gemService = Notification = undefined;
  });

  function dependencies(_$q_, _$state_, _UrlConfig_, _$httpBackend_, _$modal_, _$window_, _$rootScope_, _$stateParams_, _$componentController_, _Notification_, _cbgService_, _gemService_) {
    $q = _$q_;
    $state = _$state_;
    $modal = _$modal_;
    $window = _$window_;
    cbgService = _cbgService_;
    gemService = _gemService_;
    $scope = _$rootScope_.$new();
    Notification = _Notification_;
    $stateParams = _$stateParams_;
    $componentCtrl = _$componentController_;
    UrlConfig = _UrlConfig_;
    $httpBackend = _$httpBackend_;
  }

  function initSpies() {
    spyOn($window, 'open');
    spyOn(Notification, 'error');
    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');
    spyOn(gemService, 'isAvops').and.returnValue(true);
    spyOn($state, 'reload').and.returnValue($q.resolve());
    spyOn(gemService, 'isServicePartner').and.returnValue(true);
    spyOn($modal, 'open').and.returnValue({ result: $q.resolve() });
    spyOn(cbgService, 'getHistories').and.returnValue($q.resolve());
    spyOn(gemService, 'getRemedyTicket').and.returnValue($q.resolve());
    spyOn(cbgService, 'getOneCallbackGroup').and.returnValue($q.resolve());
    spyOn(cbgService, 'cancelCBSubmission').and.returnValue($q.resolve());
  }

  function initController() {
    $state.current.data = {};
    $stateParams.info = {
      groupId: 'ff808081582992dd01589a5b232410bb',
    };

    var getCountriesUrl = UrlConfig.getGeminiUrl() + 'countries';
    $httpBackend.expectGET(getCountriesUrl).respond(200, this.preData.getCountries);
    $httpBackend.flush();

    ctrl = $componentCtrl('cbgDetails', { $scope: $scope, $state: $state });
  }

  describe('$onInit', function () {
    function initReturnValue(catchStatus) {
      obj = _.assignIn({}, {
        Notes: _.get(this.preData, 'getNotes'),
        Histories: _.get(this.preData, 'getHistories'),
        RemedyTicket: _.get(this.preData, 'getRemedyTicket'),
        CurrentCallbackGroup: _.get(this.preData, 'getCurrentCallbackGroup'),
      });

      cbgService.getHistories.and.returnValue($q.resolve(obj.Histories));
      gemService.getRemedyTicket.and.returnValue($q.resolve(obj.RemedyTicket));
      if (catchStatus) {
        cbgService.getOneCallbackGroup.and.returnValue($q.reject({ status: 404 }));
      } else {
        cbgService.getOneCallbackGroup.and.returnValue($q.resolve(obj.CurrentCallbackGroup));
      }
    }

    it('should get all correct data on init when show the details', function () {
      initReturnValue.call(this);
      ctrl.$onInit();
      $scope.$apply();
      $scope.$emit('cbgNotesUpdated', obj.Notes);
      expect(ctrl.model).toBeDefined();
    });

    it('when status equal A', function () {
      initReturnValue.call(this);
      _.set(obj, 'CurrentCallbackGroup.status', 'A');
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.model.isEdit).toBe(false);
    });

    it('when status equal null', function () {
      initReturnValue.call(this);
      _.set(obj, 'CurrentCallbackGroup.status', '');
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.model.status_).toBe('');
    });

    it('Must throw Notification.errorResponse', function () {
      initReturnValue.call(this, true);
      ctrl.$onInit();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });

  describe('click event', function () {
    function initModel() {
      ctrl.model = {};
      ctrl.remedyTicket = {};
      ctrl.model.ccaGroupId = 'ff808081582992dd01589a5b232410bb';
      ctrl.remedyTicket.ticketUrl = 'https://smbtrws.webex.com/arsys/forms/smbtars';
    }
    beforeEach(initModel);

    it('should call $state.reload on cancelCBSubmission', function () {
      cbgService.cancelCBSubmission.and.returnValue($q.resolve());
      ctrl.onCancelSubmission();
      $scope.$apply();
      expect($state.reload).toHaveBeenCalled();
    });

    it('must throw Notification.errorResponse', function () {
      cbgService.cancelCBSubmission.and.returnValue($q.reject({ status: 404 }));
      ctrl.onCancelSubmission();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should show all histories', function () {
      ctrl.onShowAllHistories();
      $scope.$apply();
      expect(ctrl.isShowAllHistories).toBe(false);
    });

    it('should call $window.open', function () {
      ctrl.onOpenRemedyTicket();
      $scope.$apply();
      expect($window.open).toHaveBeenCalled();
    });
  });
});
