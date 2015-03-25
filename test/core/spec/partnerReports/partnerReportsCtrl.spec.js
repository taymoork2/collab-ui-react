'use strict';

describe('Controller: Partner Reports', function () {
  var controller, $scope, $q, $translate, PartnerReportService, Log, Config, Notification, AmCharts;
  var activeUsersSort = ['userName', 'orgName', 'totalCalls', 'totalPosts'];
  var dummyData = getJSONFixture('core/json/partnerReports/activeUserResponse.json');
  var dummyCustomers = getJSONFixture('core/json/partnerReports/customerResponse.json');
  var date = "March 17, 2015";

  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _$translate_, _Config_, _Log_, _Notification_, _PartnerReportService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    PartnerReportService = _PartnerReportService_;
    Log = _Log_;
    Config = _Config_;
    Notification = _Notification_;

    spyOn(PartnerReportService, 'getActiveUsersData').and.returnValue($q.when(dummyData));
    spyOn(PartnerReportService, 'getSavedActiveUsers').and.returnValue($q.when(dummyData));
    spyOn(PartnerReportService, 'getCustomerList').and.returnValue($q.when(dummyCustomers));
    spyOn(PartnerReportService, 'getMostRecentUpdate').and.returnValue($q.when(date));
    spyOn(PartnerReportService, 'getCombinedActiveUsers').and.returnValue($q.when(dummyData[0]));
    spyOn(PartnerReportService, 'getUserName').and.returnValue($q.when("Test User"));
    spyOn(PartnerReportService, 'getPreviousFilter').and.returnValue($q.when({
      id: 0
    }));

    controller = $controller('PartnerReportCtrl', {
      $scope: $scope,
      $translate: $translate,
      PartnerReportService: PartnerReportService,
      Log: Log,
      Config: Config,
      Notification: Notification
    });
  }));

  describe('PartnerReportCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    describe('activePage', function () {
      it('should return false', function () {
        expect(controller.activePage(15)).toBeFalsy();
      });

      it('should return true', function () {
        controller.activeUserCurrentPage = 1;
        expect(controller.activePage(2)).toBeTruthy();
      });
    });

    describe('changePage', function () {
      it('should change activeUserCurrentPage', function () {
        controller.changePage(5);
        expect(controller.activeUserCurrentPage).toBe(5);
      });
    });

    describe('isRefresh', function () {
      it('should return true', function () {
        expect(controller.isRefresh('refresh')).toBeTruthy();
      });

      it('should return false', function () {
        expect(controller.isRefresh('set')).toBeFalsy();
        expect(controller.isRefresh('empty')).toBeFalsy();
      });
    });

    describe('isEmpty', function () {
      it('should return true', function () {
        expect(controller.isEmpty('empty')).toBeTruthy();
      });

      it('should return false', function () {
        expect(controller.isEmpty('set')).toBeFalsy();
        expect(controller.isEmpty('refresh')).toBeFalsy();
      });
    });

    describe('mostActiveSort', function () {
      it('should sort by calls', function () {
        expect(controller.activeUserPredicate).toBe(activeUsersSort[2]);
        expect(controller.activeUserReverse).toBeTruthy();
        controller.mostActiveSort(2);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[2]);
        expect(controller.activeUserReverse).toBeFalsy();
      });

      it('should sort by posts', function () {
        controller.mostActiveSort(3);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[3]);
        expect(controller.activeUserReverse).toBeTruthy();
      });

      it('should sort by userName', function () {
        controller.mostActiveSort(0);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[0]);
        expect(controller.activeUserReverse).toBeFalsy();
      });

      it('should sort by userName', function () {
        controller.mostActiveSort(1);
        expect(controller.activeUserPredicate).toBe(activeUsersSort[1]);
        expect(controller.activeUserReverse).toBeFalsy();
      });
    });

    describe('pageForward', function () {
      it('should change carousel button numbers', function () {
        controller.activeUsersTotalPages = 4;
        controller.pageForward();
        expect(controller.activeButton[0]).toBe(2);
        expect(controller.activeButton[1]).toBe(3);
        expect(controller.activeButton[2]).toBe(4);
      });

      it('should not change carousel button numbers', function () {
        controller.activeUsersTotalPages = 3;
        controller.pageForward();
        expect(controller.activeButton[0]).toBe(1);
        expect(controller.activeButton[1]).toBe(2);
        expect(controller.activeButton[2]).toBe(3);
      });
    });

    describe('pageBackward', function () {
      it('should change carousel button numbers', function () {
        controller.activeButton[0] = 2;
        controller.activeButton[1] = 3;
        controller.activeButton[2] = 4;

        controller.pageBackward();
        expect(controller.activeButton[0]).toBe(1);
        expect(controller.activeButton[1]).toBe(2);
        expect(controller.activeButton[2]).toBe(3);
      });

      it('should not change carousel button numbers', function () {
        controller.pageBackward();
        expect(controller.activeButton[0]).toBe(1);
        expect(controller.activeButton[1]).toBe(2);
        expect(controller.activeButton[2]).toBe(3);
      });
    });

    describe('updateReports', function () {
      it('should update active users and call getSavedActiveUsers', function () {
        controller.updateReports();

        expect(controller.activeUsersTotalPages).toBe(0);
        expect(controller.activeUserCurrentPage).toBe(0);
        expect(controller.activeButton[0]).toBe(1);
        expect(controller.activeButton[1]).toBe(2);
        expect(controller.activeButton[2]).toBe(3);
      });
    });
  });
});
