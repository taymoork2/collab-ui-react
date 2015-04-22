'use strict';

describe('Service: Partner Reports Service', function () {
  var $httpBackend, PartnerReportService, Config, Notification;
  var managedOrgsUrl, activeUsersDetailedUrl, mostActiveUsersUrl;

  beforeEach(module('Core'));

  var dateFormat = "MMM DD, YYYY";
  var customerGroup = 0;
  var timeFilter = {
    'id': 0
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
  var fiveCustomersDataPoint = {
    modifiedDate: 'Apr 08, 2015',
    details: {
      activeUsers: '0',
      totalRegisteredUsers: '1'
    },
    percentage: 61,
    activeUsers: 29,
    totalRegisteredUsers: 47,
    date: '2015-04-08T02:00:00.000-05:00'
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
  var fiveCustomerTableData = {
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
    describe('should notify an error for setActiveUsersData', function () {
      it('when activeUsersDetailed does not return data', function () {
        $httpBackend.whenGET(managedOrgsUrl).respond(customerData);
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(500, error);
        PartnerReportService.setActiveUsersData(timeFilter).then(function () {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        });
        $httpBackend.flush();
      });

      it('when managedOrgs does not return data', function () {
        $httpBackend.whenGET(managedOrgsUrl).respond(500, error);
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(activeUserDetailedData);
        PartnerReportService.setActiveUsersData(timeFilter).then(function () {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        });
        $httpBackend.flush();
      });
    });

    describe('should getActiveUserData', function () {
      beforeEach(function () {
        $httpBackend.whenGET(managedOrgsUrl).respond(customerData);
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(activeUserDetailedData);
        $httpBackend.whenGET(mostActiveUsersUrl + "&orgId=" + customers[0].customerOrgId).respond(mostActiveUserData);
        $httpBackend.whenGET(mostActiveUsersUrl + "&orgId=" + customers[1].customerOrgId).respond(mostActiveUserData);
        $httpBackend.whenGET(mostActiveUsersUrl + "&orgId=" + customers[2].customerOrgId).respond(mostActiveUserData);
        PartnerReportService.setActiveUsersData(timeFilter);
        $httpBackend.flush();
      });

      it('for an existing customer', function () {
        PartnerReportService.getActiveUserData(customers[0].customerOrgId, customers[0].customerName).then(function (response) {
          expect(response.graphData[0]).toEqual(customerDatapoint);
          expect(response.tableData[0]).toEqual(customerTableDataPoint);
        });
        $httpBackend.flush();
      });

      it('for a customer group', function () {
        PartnerReportService.getActiveUserData(customerGroup, "").then(function (response) {
          expect(response.graphData[0]).toEqual(fiveCustomersDataPoint);
          expect(response.tableData[0]).toEqual(fiveCustomerTableData);
        });
        $httpBackend.flush();
      });
    });

    describe('should notify an error for getActiveUserData', function () {
      it('and return empty table data', function () {
        $httpBackend.whenGET(managedOrgsUrl).respond(customerData);
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(activeUserDetailedData);
        $httpBackend.whenGET(mostActiveUsersUrl + "&orgId=" + customers[0].customerOrgId).respond(500, error);
        PartnerReportService.setActiveUsersData(timeFilter);
        $httpBackend.flush();

        PartnerReportService.getActiveUserData(customers[0].customerOrgId, customers[0].customerName).then(function (response) {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
          expect(response.graphData[0]).toEqual(customerDatapoint);
          expect(response.tableData).toEqual([]);
        });
        $httpBackend.flush();
      });

      it('and return empty graph and table data', function () {
        $httpBackend.whenGET(managedOrgsUrl).respond(customerData);
        $httpBackend.whenGET(activeUsersDetailedUrl).respond(500, error);
        $httpBackend.whenGET(mostActiveUsersUrl + "&orgId=" + customers[0].customerOrgId).respond(500, error);
        PartnerReportService.setActiveUsersData(timeFilter);
        $httpBackend.flush();

        PartnerReportService.getActiveUserData(customers[0].customerOrgId, customers[0].customerName).then(function (response) {
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
          expect(response.graphData).toEqual([]);
          expect(response.tableData).toEqual([]);
        });
        $httpBackend.flush();
      });
    });
  });

  describe('Helper Services', function () {
    beforeEach(function () {
      $httpBackend.whenGET(managedOrgsUrl).respond(customerData);
      $httpBackend.whenGET(activeUsersDetailedUrl).respond(activeUserDetailedData);
      PartnerReportService.setActiveUsersData(timeFilter);
      $httpBackend.flush();
    });

    it('getCustomerList should return a list of customers', function () {
      var list = PartnerReportService.getCustomerList();
      expect(list.customers).toEqual(customers);
      expect(list.recentUpdate).toEqual(moment(activeUserDetailedData.date).format(dateFormat));
    });

    it('getPreviousFilter should return the last timeFilter used to generate queries', function () {
      var filter = PartnerReportService.getPreviousFilter();
      expect(filter).toEqual(timeFilter);
    });
  });
});
