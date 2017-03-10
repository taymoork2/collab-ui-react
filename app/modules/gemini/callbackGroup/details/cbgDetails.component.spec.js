'use strict';

describe('Component: CbgDetails', function () {
  var $q, $state, $modal, $scope, $stateParams, $window, $componentCtrl;
  var obj, ctrl, cbgService, gemService, Notification;
  var preData = getJSONFixture('gemini/common.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  afterEach(function () {
    $q = $state = $modal = $scope = $stateParams = $window = $componentCtrl = obj = ctrl = cbgService = gemService = Notification = undefined;
  });
  afterAll(function () {
    preData = undefined;
  });

  function dependencies(_$q_, _$state_, _$modal_, _$window_, _$rootScope_, _$stateParams_, _$componentController_, _Notification_, _cbgService_, _gemService_) {
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
  }

  function initSpies() {
    spyOn($window, 'open');
    spyOn(Notification, 'error');
    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');
    spyOn(gemService, 'isAvops').and.returnValue(true);
    spyOn($state, 'reload').and.returnValue($q.resolve());
    spyOn(gemService, 'isServicePartner').and.returnValue(true);
    spyOn(cbgService, 'getNotes').and.returnValue($q.resolve());
    spyOn($modal, 'open').and.returnValue({ result: $q.resolve() });
    spyOn(cbgService, 'getHistories').and.returnValue($q.resolve());
    spyOn(gemService, 'getRemedyTicket').and.returnValue($q.resolve());
    spyOn(cbgService, 'getOneCallbackGroup').and.returnValue($q.resolve());
    spyOn(cbgService, 'updateCallbackGroupStatus').and.returnValue($q.resolve());
  }

  function initController() {
    $state.current.data = {};
    $stateParams.info = {
      groupId: 'ff808081582992dd01589a5b232410bb',
    };
    ctrl = $componentCtrl('cbgDetails', { $scope: $scope, $state: $state });
  }

  function setMockData(key, val) {
    preData.common = {
      'links': [],
      'content': {
        'data': {
          'body': '',
          'returnCode': 0,
          'trackId': '',
        },
        'health': {
          'code': 200,
          'status': 'OK',
        },
      },
    };
    var info = preData.common;
    _.set(info, key, val);
    return info;
  }

  describe('$onInit', function () {
    function initReturnValue(catchStatus) {
      obj = {};
      obj.Notes = setMockData('content.data.body', preData.getNotes);
      obj.Histories = setMockData('content.data.body', preData.getHistories);
      obj.RemedyTicket = setMockData('content.data', preData.getRemedyTicket);
      obj.CurrentCallbackGroup = setMockData('content.data.body', preData.getCurrentCallbackGroup);

      cbgService.getNotes.and.returnValue($q.resolve(obj.Notes));
      cbgService.getHistories.and.returnValue($q.resolve(obj.Histories));
      gemService.getRemedyTicket.and.returnValue($q.resolve(obj.RemedyTicket));
      if (catchStatus) {
        cbgService.getOneCallbackGroup.and.returnValue($q.reject({ 'status': 404 }));
      } else {
        cbgService.getOneCallbackGroup.and.returnValue($q.resolve(obj.CurrentCallbackGroup));
      }
    }

    it('should get all correct data on init when show the details', function () {
      initReturnValue();
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.model).toBeDefined();
    });

    it('when status equal A', function () {
      initReturnValue();
      obj.CurrentCallbackGroup.content.data.body.status = 'A';
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.model.isEdit).toBe(false);
    });

    it('when status equal null', function () {
      initReturnValue();
      obj.CurrentCallbackGroup.content.data.body.status = '';
      ctrl.$onInit();
      $scope.$apply();
      expect(ctrl.model.status_).toBe('');
    });

    it('Must throw Notification.errorResponse', function () {
      initReturnValue(true);
      ctrl.$onInit();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should get all error data on init when show the details', function () {
      initReturnValue();
      obj.Notes.content.data.returnCode = 1000;
      obj.Histories.content.data.returnCode = 1000;
      obj.CurrentCallbackGroup.content.data.returnCode = 1000;
      ctrl.$onInit();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalled();
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

    it('should call $state.reload on updateCallbackGroupStatus', function () {
      var response = preData.common;
      response.content.data.returnCode = 0;
      response.content.data.body = 'ff808081582992dd01588fd31ee80fa2';
      cbgService.updateCallbackGroupStatus.and.returnValue($q.resolve(response));
      ctrl.onCancelSubmission();
      $scope.$apply();
      expect($state.reload).toHaveBeenCalled();
    });

    it('must throw Notification.errorResponse', function () {
      cbgService.updateCallbackGroupStatus.and.returnValue($q.reject({ 'status': 404 }));
      ctrl.onCancelSubmission();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should call Notification.notify on updateCallbackGroupStatus', function () {
      var response = preData.common;
      response.content.data.returnCode = 1000;
      cbgService.updateCallbackGroupStatus.and.returnValue($q.resolve(response));
      ctrl.onApprove();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalled();
    });

    it('should call $state.reload on updateCallbackGroupStatus', function () {
      var response = preData.common;
      response.content.data.returnCode = 0;
      response.content.data.body = 'ff808081582992dd01588fd31ee80fa2';
      cbgService.updateCallbackGroupStatus.and.returnValue($q.resolve(response));
      ctrl.onDecline();
      $scope.$apply();
      expect($modal.open).toHaveBeenCalled();
    });

    it('should return a boolean for ctrl.btnCompleteLoading', function () {
      var response = preData.common;
      response.content.data.returnCode = 0;
      cbgService.updateCallbackGroupStatus.and.returnValue($q.resolve(response));
      ctrl.onComplete();
      $scope.$apply();
      expect(ctrl.btnCompleteLoading).toBe(true);
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
