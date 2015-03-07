'use strict';

describe('Controller: Partner Reports', function () {
  var controller, $scope, $translate, PartnerService, Log;
  var refreshTab = {
    title: 'reports.engagementTab',
    name: 'engagement',
    status: 'refresh',
  };
  var setTab = {
    title: 'reports.engagementTab',
    name: 'engagement',
    status: 'set',
  };

  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _$translate_, _PartnerService_, _Log_) {
    $scope = $rootScope.$new();
    $translate = _$translate_;
    PartnerService = _PartnerService_;
    Log = _Log_;

    controller = $controller('PartnerReportCtrl', {
      $scope: $scope,
      $translate: $translate,
      PartnerService: PartnerService,
      Log: Log
    });
  }));

  describe('PartnerReportCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined;
    });

    describe('isRefresh', function () {
      it('should return true', function () {
        expect(controller.isRefresh(refreshTab)).toBeTruthy();
      });

      it('should return false', function () {
        expect(controller.isRefresh(setTab)).toBeFalsy();
      });
    });
  });
});
