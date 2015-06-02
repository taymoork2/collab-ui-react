(function () {
  'use strict';

  angular.module('Core')
    .service('PartnerReportService', PartnerReportService);

  /* @ngInject */
  function PartnerReportService($http, $translate, $q, Config, Authinfo, Notification, Log, PartnerService) {
    var urlBase = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    var detailed = 'detailed';
    var topn = 'topn';
    var activeUserUrl = '/managedOrgs/activeUsers';
    var dateFormat = "MMM DD, YYYY";
    var mostRecentUpdate = "";
    var customerList = null;

    var mediaQualityUrl = 'modules/core/partnerReports/mediaQuality/mediaQualityFake.json';
    var mediaQualityData = [];

    var callMetricsData = {
      dataProvider: [{
        "callCondition": $translate.instant('callMetrics.callConditionFail'),
        "numCalls": 0
      }, {
        "callCondition": $translate.instant('callMetrics.callConditionPoorMedia'),
        "numCalls": 0
      }, {
        "callCondition": $translate.instant('callMetrics.callConditionSuccessful'),
        "numCalls": 0
      }],
      labelData: {
        "numTotalCalls": 0,
        "numTotalMinutes": 0
      }
    };

    return {
      getActiveUserData: getActiveUserData,
      getCustomerList: getCustomerList,
      getMostRecentUpdate: getMostRecentUpdate,
      getMediaQualityMetrics: getMediaQualityMetrics,
      getCallMetricsData: getCallMetricsData,
      getRegesteredEndpoints: getRegesteredEndpoints
    };

    function getActiveUserData(customer, time) {
      var query = getQuery(time);
      var promises = [];
      var graphData = [];
      var tableData = [];

      var graphPromise = getActiveUserGraphData(customer, query).then(function (response) {
        graphData = response;
      });
      var tablePromise = getActiveUserTableData(customer, query).then(function (response) {
        tableData = response;
      });
      promises.push(graphPromise);
      promises.push(tablePromise);

      return $q.all(promises).then(function () {
        return {
          graphData: graphData,
          tableData: tableData
        };
      });
    }

    function getMostRecentUpdate() {
      return mostRecentUpdate;
    }

    function getCustomerList() {
      var orgPromise = $q.defer();
      if (customerList === null) {
        PartnerService.getManagedOrgsList(function (data, status) {
          if (data.success) {
            customerList = data.organizations;
            orgPromise.resolve(customerList);
          } else {
            Log.debug('Failed to retrieve managed orgs information. Status: ' + status);
            Notification.notify([$translate.instant('reportsPage.customerLoadError')], 'error');
            orgPromise.reject([]);
          }
        });
      } else {
        orgPromise.resolve(customerList);
      }

      return orgPromise.promise;
    }

    function getService(url) {
      return $http.get(urlBase + url);
    }

    function getQuery(filter) {
      if (filter.value === 0) {
        return '?&intervalCount=1&intervalType=week&spanCount=1&spanType=day&cache=false';
      } else if (filter.value === 1) {
        return '?&intervalCount=1&intervalType=month&spanCount=1&spanType=week&cache=false';
      } else {
        return '?&intervalCount=3&intervalType=month&spanCount=1&spanType=month&cache=false';
      }
    }

    function setMostRecentUpdate(data) {
      if (data.data !== undefined && data.data.date !== null && data.data.date !== undefined) {
        mostRecentUpdate = moment(data.data.date).format(dateFormat);
      }
    }

    function getActiveUserGraphData(customer, query) {
      if (angular.isArray(customer)) {
        return combineActiveUsersGraph(customer, query);
      } else {
        return getService(detailed + activeUserUrl + query + "&orgId=" + customer.value).then(function (response) {
          if (mostRecentUpdate === "") {
            setMostRecentUpdate(response);
          }
          return modifyActiveUserGraphData(response.data.data[0]);
        }, function (error) {
          Log.debug('Loading active user graph data for customer ' + customer.label + ' failed.  Status: ' + error.status + ' Response: ' + error.message);
          Notification.notify([$translate.instant('activeUsers.activeUserGraphError', {
            customer: customer.label
          })], 'error');
          return [];
        });
      }
    }

    function modifyActiveUserGraphData(data) {
      if (data !== undefined && data !== null) {
        angular.forEach(data.data, function (index) {
          index.percentage = Math.floor((parseInt(index.details.activeUsers) / parseInt(index.details.totalRegisteredUsers)) * 100);
          index.activeUsers = parseInt(index.details.activeUsers);
          index.totalRegisteredUsers = parseInt(index.details.totalRegisteredUsers);
          index.modifiedDate = moment(index.date).format(dateFormat);
        });
        return data.data;
      } else {
        return [];
      }
    }

    // Keeping function for use when mult-org select functionality is added.
    function combineActiveUsersGraph(orgs, query) {
      var promises = [];
      var graphData = [];
      angular.forEach(orgs, function (org) {
        var promise = getActiveUserGraphData(org, query).then(function (orgData) {
          angular.forEach(orgData, function (data) {
            graphData = combineMatchingDates(graphData, data);
          });
        });
        promises.push(promise);
      });

      return $q.all(promises).then(function () {
        // not all customers have active data for every day
        // this can cause data to be out of order without sorting
        return graphData.sort(function (a, b) {
          if (a.date === b.date) {
            return 0;
          } else if (a.date > b.date) {
            return 1;
          }
          return -1;
        });
      });
    }

    function combineMatchingDates(graphData, dateData) {
      var updated = false;

      if (graphData.length > 0) {
        for (var i = 0; i < graphData.length; i++) {
          if (graphData[i].modifiedDate.indexOf(dateData.modifiedDate) !== -1) {
            graphData[i].totalRegisteredUsers += dateData.totalRegisteredUsers;
            graphData[i].activeUsers += dateData.activeUsers;
            graphData[i].percentage = Math.floor((graphData[i].activeUsers / graphData[i].totalRegisteredUsers) * 100);
            updated = true;
            break;
          }
        }
      }

      if (!updated) {
        graphData.push(angular.copy(dateData));
      }
      return graphData;
    }

    function getActiveUserTableData(customer, query) {
      if (angular.isArray(customer)) {
        return combineActiveUsersTable(customer);
      } else {
        return getService(topn + activeUserUrl + query + "&orgId=" + customer.value).then(function (response) {
          if (mostRecentUpdate === "") {
            setMostRecentUpdate(response);
          }
          return modifyActiveUserTableData(response.data.data[0]);
        }, function (error) {
          Log.debug('Loading most active users for customer ' + customer.label + ' failed.  Status: ' + error.status + ' Response: ' + error.message);
          Notification.notify([$translate.instant('activeUsers.activeUserTableError', {
            customer: customer.label
          })], 'error');
          return [];
        });
      }
    }

    function modifyActiveUserTableData(data) {
      angular.forEach(data.data, function (index) {
        index.orgName = data.orgName;
        index.numCalls = parseInt(index.details.numCalls);
        index.totalActivity = parseInt(index.details.totalActivity);
        index.userId = index.details.userId;
        index.userName = index.details.userName;
      });
      return data.data;
    }

    // Keeping function for use when mult-org select functionality is added.
    function combineActiveUsersTable(orgs) {
      var promises = [];
      var tableData = [];
      angular.forEach(orgs, function (org) {
        var promise = getActiveUserTableData(org.orgId, org.orgName).then(function (response) {
          tableData = tableData.concat(response);
        });
        promises.push(promise);
      });
      return $q.all(promises).then(function () {
        return tableData;
      });
    }

    function getMediaQualityMetrics() {
      return $http.get(mediaQualityUrl).success(function (response) {
        if (response.data !== null && response.data !== undefined) {
          var graphData = response.data;
          angular.forEach(graphData, function (index) {
            index.data = modifyMediaQualityGraphData(index.data);
          });
          return graphData.data;
        }
      });
    }

    function modifyMediaQualityGraphData(data) {
      angular.forEach(data, function (index) {
        index.excellent = parseInt(index.details.excellent);
        index.good = parseInt(index.details.good);
        index.fair = parseInt(index.details.fair);
        index.poor = parseInt(index.details.poor);
        index.totalCalls = index.details.excellent + index.details.good + index.details.fair + index.details.poor;
        index.modifiedDate = moment(index.date).format("MMM DD");
      });
      return data;
    }

    function getCallMetricsData() {
      var getMetricsUrl = 'modules/core/partnerReports/callMetrics/callMetricsTemp.json';
      return $http.get(getMetricsUrl).then(function (response) {
        if (angular.isArray(response.data.data) && response.data.data.length !== 0) {
          return transformRawCallMetricsData(response.data.data[0]);
        } else {
          return [];
        }
      }, function (error) {
        return [];
      });
    }

    function transformRawCallMetricsData(data) {
      var transformData = angular.copy(callMetricsData);
      var numCalls = 0;
      var numMinutes = 0;

      angular.forEach(data.data, function (index) {
        if (index.details.type === "fail") {
          transformData.dataProvider[0].numCalls = index.details.numCalls;
        } else if (index.details.type === "poor") {
          transformData.dataProvider[1].numCalls = index.details.numCalls;
        } else if (index.details.type === "success") {
          transformData.dataProvider[2].numCalls = index.details.numCalls;
        }

        numCalls = numCalls + parseInt(index.details.numCalls);
        numMinutes = numMinutes + parseInt(index.details.numMinutes);
      });

      transformData.labelData.numTotalCalls = numCalls;
      transformData.labelData.numTotalMinutes = numMinutes;
      return transformData;
    }

    function getRegesteredEndpoints(customer) {
      if (angular.isArray(customer)) {
        var returnArray = [];
        var promises = [];

        angular.forEach(customer, function (index) {
          var promise = getRegesteredEndpoints(index).then(function (response) {
            returnArray.concat(response);
          });
          promises.push(promise);
        });

        return $q.all(promises).then(function () {
          return returnArray;
        });
      } else {
        return $http.get('modules/core/partnerReports/registeredEndpoints/fakeData.json').then(function (response) {
          var data = response.data.data[0].data[0].details;
          var change = data.current - data.previous;
          if (change < 0) {
            return [{
              customer: customer.label,
              endpoints: data.current,
              trend: '-' + Math.abs(change),
              direction: "negative",
              pending: ''
            }];
          } else {
            return [{
              customer: customer.label,
              endpoints: data.current,
              trend: "+" + change,
              direction: "positive",
              pending: ''
            }];
          }
        }, function (error) {
          Log.debug('Loading regestered endpoints for customer ' + customer.label + ' failed.  Status: ' + error.status + ' Response: ' + error.message);
          Notification.notify([$translate.instant('registeredEndpoints.registeredEndpointsError', {
            customer: customer.label
          })], 'error');
          return [];
        });
      }
    }
  }
})();
