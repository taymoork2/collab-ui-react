'use strict';

angular
  .module('Core')
  .service('CannedDataService', CannedDataService);

/* @ngInject */
function CannedDataService(Authinfo, $rootScope, $timeout) {

  var demoAccounts = [
    '8522d94e-860b-4841-9110-e5f668107363',
    'ac4788d8-d5b5-4c5b-9612-2edbe697af1e',
    '5b14d0f2-7daf-46d3-b040-3357b4336bf9',
    '324f8fd1-8996-4035-ab4e-7433c6d7bdcd',
    '258b2bd4-c385-40e9-bcf1-f7176699ce62',
    'b9e386a2-fd86-4f36-ab5a-a8fcddb99812',
    '9d85bac2-e4bf-4480-9f6f-a59abfd354bb'
  ];

  var dataSize = 5;
  var allCustomerAllData = [];
  var singleCustomerAllData = {};
  var allCustomerAllCount = [];
  var customerLandingCount = [];
  var onboardingAllData = {};

  var onboardingFunnel = 'onboardingFunnelLoaded';

  var funnelLimits = [{
    type: 'active_last_week',
    limit: 1000
  }, {
    type: 'onboarded',
    limit: 2500
  }, {
    type: 'organization_size',
    limit: 5000
  }];

  var chartLimits = [{
    type: 'entitlementsLoaded',
    limit: 1000,
    values: [50, 75, 90, 90, 110],
    offset: 10
  }, {
    type: 'avgCallsPerUserLoaded',
    limit: 50,
    values: [25, 35, 45, 55, 65],
    offset: 15
  }, {
    type: 'avgConversationsLoaded',
    limit: 50,
    values: [25, 35, 20, 55, 65],
    offset: 5
  }, {
    type: 'activeUsersLoaded',
    limit: 500,
    values: [200, 225, 200, 275, 450],
    offset: 12

  }, {
    type: 'convOneOnOneLoaded',
    limit: 100,
    values: [50, 100, 150, 200, 250],
    offset: 25
  }, {
    type: 'convGroupLoaded',
    limit: 50,
    values: [25, 35, 50, 45, 65],
    offset: 15
  }, {
    type: 'callsLoaded',
    limit: 100,
    values: [50, 55, 150, 175, 185],
    offset: 25
  }, {
    type: 'callsAvgDurationLoaded',
    limit: 2,
    values: [1, 1, 1, 4, 7],
    offset: 1
  }, {
    type: 'contentSharedLoaded',
    limit: 1000,
    values: [100, 200, 300, 250, 350],
    offset: 50
  }, {
    type: 'contentShareSizesLoaded',
    limit: 5,
    values: [1, 6, 11, 16, 21],
    offset: 2
  }, {
    type: 'conversationsLoaded',
    limit: 100,
    values: [50, 100, 150, 175, 200],
    offset: 25
  }];

  var customerLandingCountLimits = [{
    type: 'callsCountLoaded',
    limit: 500
  }, {
    type: 'conversationsCountLoaded',
    limit: 500
  }, {
    type: 'contentSharedCountLoaded',
    limit: 1000
  }];

  var countLimits = [{
    type: 'activeUserCountLoaded',
    limit: 6000
  }, {
    type: 'averageCallCountLoaded',
    limit: 500
  }, {
    type: 'contentSharedCountLoaded',
    limit: 8000
  }, {
    type: 'entitlementCountLoaded',
    limit: 6000
  }];

  var sendChartResponse = function (type, allData) {
    var response = {
      data: allData,
      status: 200,
    };

    $timeout(function () {
      $rootScope.$broadcast(type, response);
    }, 2000);
  };

  var createFunnelResponse = function () {
    var funnelResponse = {};
    funnelResponse.date = moment().toISOString();
    funnelResponse.success = true;
    funnelResponse.data = [];

    for (var counts in funnelLimits) {
      var currentFunnel = funnelLimits[counts];
      var obj = {
        title: currentFunnel.type,
        value: Math.floor(Math.random() * (currentFunnel.limit - currentFunnel.limit / 2) + currentFunnel.limit / 2)
      };
      funnelResponse.data.push(obj);
    }

    onboardingAllData.data = funnelResponse;
    onboardingAllData.type = onboardingFunnel;
    sendChartResponse(onboardingFunnel, funnelResponse);
  };

  var createCountResponse = function (limits) {
    for (var count in limits) {
      var currentCount = limits[count];
      var offset = 50;
      var obj = {
        success: true,
        data: Math.floor(currentCount.limit + Math.random() * offset)
      };
      var current = {
        type: currentCount.type,
        data: obj
      };
      allCustomerAllCount.push(current);
      sendChartResponse(currentCount.type, obj);
    }
  };

  var createSingleCustomerResponse = function (orgId) {
    singleCustomerAllData[orgId] = [];
    for (var chart in chartLimits) {
      var currentCustomerData = {};
      currentCustomerData.data = [];
      currentCustomerData.success = true;
      currentCustomerData.date = moment().toISOString();
      var currentDate = moment();
      var currentChart = chartLimits[chart];

      for (var i = 0; i < dataSize; i++) {
        var isoDate = currentDate.toISOString();
        var newData = {
          date: isoDate,
          //count: Math.floor(Math.random() * (currentChart.limit - currentChart.limit / 2) + currentChart.limit / 2)
          count: Math.floor(currentChart.values[i] - Math.random() * currentChart.offset)
        };
        currentDate = currentDate.subtract(7, 'days');
        currentCustomerData.data.push(newData);
      }
      var obj = {
        type: currentChart.type,
        data: currentCustomerData
      };
      singleCustomerAllData[orgId].push(obj);
      sendChartResponse(currentChart.type, currentCustomerData);
    }
  };

  var createCustomerResponse = function () {
    for (var chart in chartLimits) {
      var allCustomerData = {};
      allCustomerData.data = [];
      allCustomerData.success = true;
      allCustomerData.date = moment().toISOString();
      var currentChart = chartLimits[chart];
      var managedOrgs = Authinfo.getManagedOrgs();

      for (var managedOrg in managedOrgs) {
        var currentDate = moment();
        var orgObj = {
          orgName: managedOrgs[managedOrg],
          data: []
        };

        for (var i = dataSize - 1; i > -1; i--) {
          var isoDate = currentDate.toISOString();
          var newData = {
            date: isoDate,
            // count: Math.floor(Math.random() * (currentChart.limit - currentChart.limit / 2) + currentChart.limit / 2)
            count: Math.floor(currentChart.values[i] + Math.random() * currentChart.offset)
          };
          currentDate = currentDate.subtract(7, 'days');
          orgObj.data.push(newData);
        }
        allCustomerData.data.push(orgObj);
      }
      var chartObj = {
        type: currentChart.type,
        data: allCustomerData
      };
      allCustomerAllData.push(chartObj);
      sendChartResponse(currentChart.type, allCustomerData);
    }
  };

  return {
    isDemoAccount: function (orgId) {
      return demoAccounts.indexOf(orgId) > -1;
    },
    getAllCustomersData: function () {
      if (allCustomerAllData !== null && allCustomerAllData.length > 0 && allCustomerAllCount !== null && allCustomerAllCount.length > 0) {
        for (var charts in allCustomerAllData) {
          var current = allCustomerAllData[charts];
          sendChartResponse(current.type, current.data);
        }
        for (var counts in allCustomerAllCount) {
          var currentCount = allCustomerAllCount[counts];
          sendChartResponse(currentCount.type, currentCount.data);
        }
      } else {
        createCustomerResponse();
        createCountResponse(countLimits);
      }
    },
    getIndCustomerData: function (orgId) {
      if (_.has(singleCustomerAllData, orgId)) {
        var currentOrg = singleCustomerAllData[orgId];
        for (var charts in currentOrg) {
          sendChartResponse(currentOrg[charts].type, currentOrg[charts].data);
        }
      } else {
        createSingleCustomerResponse(orgId);
      }
    },
    getFunnelData: function (orgId) {
      if (_.has(onboardingAllData, 'type') && _.has(onboardingAllData, 'data')) {
        (onboardingAllData.data.data).reverse();
        sendChartResponse(onboardingAllData.type, onboardingAllData.data);
      } else {
        createFunnelResponse();
      }
    },
    getCustomerCounts: function () {
      if (allCustomerAllCount !== null && allCustomerAllCount.length > 0) {
        for (var counts in allCustomerAllCount) {
          var currentCount = allCustomerAllCount[counts];
          sendChartResponse(currentCount.type, currentCount.data);
        }
      } else {
        createCountResponse(customerLandingCountLimits);
      }

    }
  };
}
