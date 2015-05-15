'use strict';

describe('Service: Partner Reports Service', function () {
  var $httpBackend, PartnerReportService, Config, Notification;
  var managedOrgsUrl, activeUsersDetailedUrl, mostActiveUsersUrl;

  beforeEach(module('Core'));

  var dateFormat = "MMM DD, YYYY";
  var timeFilter = {
    value: 0
  };
  var customers = getJSONFixture('core/json/partnerReports/customerResponse.json');
  var activeUserDetailedData = getJSONFixture('core/json/partnerReports/activeUserDetailedResponse.json');
  var mostActiveUserData = getJSONFixture('core/json/partnerReports/mostActiveUserResponse.json');
  var customerData = {
    'organizations': getJSONFixture('core/json/partnerReports/customerResponse.json')
  };

  var error = {
    message: 'error'
  };
  var customer = {
    value: customers[0].customerOrgId,
    label: customers[0].customerName
  };
  var customerDatapoint = {
    modifiedDate: 'Apr 10, 2015',
    details: {
      activeUsers: '14',
      totalRegisteredUsers: '14'
    },
    percentage: 100,
    activeUsers: 14,
    totalRegisteredUsers: 14,
    date: '2015-04-10T02:00:00.000-05:00'
  };
  var customerTableDataPoint = {
    details: {
      numCalls: '5',
      totalActivity: '14',
      userId: '4a0a7af3-5924-420d-9ec0-dcfccbe607cf',
      userName: 'havard.nigardsoy@vijugroup.com'
    },
    orgName: 'Test Org One',
    numCalls: 5,
    totalActivity: 14,
    userId: '4a0a7af3-5924-420d-9ec0-dcfccbe607cf',
    userName: 'havard.nigardsoy@vijugroup.com'
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _PartnerReportService_, _Config_, _Notification_) {
    $httpBackend = _$httpBackend_;
    PartnerReportService = _PartnerReportService_;
    Config = _Config_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');

    managedOrgsUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';

    var baseUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    activeUsersDetailedUrl = baseUrl + 'detailed/managedOrgs/activeUsers?&intervalCount=1&intervalType=week&spanCount=1&spanType=day&cache=false';
    mostActiveUsersUrl = baseUrl + 'topn/managedOrgs/activeUsers?&intervalCount=1&intervalType=week&spanCount=1&spanType=day&cache=false';
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(PartnerReportService).toBeDefined();
  });

  describe('Active User Services', function () {
    describe('should getActiveUserData', function () {
      beforeEach(function () {
        $httpBackend.whenGET(mostActiveUsersUrl + "&orgId=" + customers[0].customerOrgId).respond(mostActiveUserData);
        $httpBackend.whenGET(activeUsersDetailedUrl + "&orgId=" + customers[0].customerOrgId).respond(activeUserDetailedData);
      });

      it('for an existing customer', function () {
        PartnerReportService.getActiveUserData(customer, timeFilter).then(function (response) {
          expect(response.graphData[0]).toEqual(customerDatapoint);
          expect(response.tableData[0]).toEqual(customerTableDataPoint);
        });
        $httpBackend.flush();
      });
    });

    describe('should notify an error for getActiveUserData', function () {
      it('and return empty table data', function () {
        $httpBackend.whenGET(mostActiveUsersUrl + "&orgId=" + customers[0].customerOrgId).respond(500, error);
        $httpBackend.whenGET(activeUsersDetailedUrl + "&orgId=" + customers[0].customerOrgId).respond(activeUserDetailedData);

        PartnerReportService.getActiveUserData(customer, timeFilter).then(function (response) {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
          expect(response.graphData[0]).toEqual(customerDatapoint);
          expect(response.tableData).toEqual([]);
        });
        $httpBackend.flush();
      });

      it('and return empty graph data', function () {
        $httpBackend.whenGET(mostActiveUsersUrl + "&orgId=" + customers[0].customerOrgId).respond(mostActiveUserData);
        $httpBackend.whenGET(activeUsersDetailedUrl + "&orgId=" + customers[0].customerOrgId).respond(500, error);

        PartnerReportService.getActiveUserData(customer, timeFilter).then(function (response) {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
          expect(response.graphData).toEqual([]);
          expect(response.tableData[0]).toEqual(customerTableDataPoint);
        });
        $httpBackend.flush();
      });

      it('and return empty graph and table data', function () {
        $httpBackend.whenGET(mostActiveUsersUrl + "&orgId=" + customers[0].customerOrgId).respond(500, error);
        $httpBackend.whenGET(activeUsersDetailedUrl + "&orgId=" + customers[0].customerOrgId).respond(500, error);

        PartnerReportService.getActiveUserData(customer, timeFilter).then(function (response) {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
          expect(response.graphData).toEqual([]);
          expect(response.tableData).toEqual([]);
        });
        $httpBackend.flush();
      });
    });
  });

  describe('Helper Services', function () {
    it('getCustomerList should return a list of customers', function () {
      $httpBackend.whenGET(managedOrgsUrl).respond(customerData);
      PartnerReportService.getCustomerList().then(function (list) {
        expect(list).toEqual(customers);
      });
      $httpBackend.flush();
    });

    it('getCustomerList should flag an error when managedOrgs does not return data', function () {
      $httpBackend.whenGET(managedOrgsUrl).respond(500, error);
      PartnerReportService.getCustomerList().then(function (list) {
        expect(list).toEqual([]);
      });
      $httpBackend.flush();
    });

    it('getMostRecentUpdate should return the most recent update', function () {
      $httpBackend.whenGET(mostActiveUsersUrl + "&orgId=" + customers[0].customerOrgId).respond(mostActiveUserData);
      $httpBackend.whenGET(activeUsersDetailedUrl + "&orgId=" + customers[0].customerOrgId).respond(activeUserDetailedData);

      PartnerReportService.getActiveUserData(customer, timeFilter).then(function (response) {
        expect(PartnerReportService.getMostRecentUpdate()).toEqual(moment(activeUserDetailedData.date).format(dateFormat));
      });
      $httpBackend.flush();
    });
  });
});
