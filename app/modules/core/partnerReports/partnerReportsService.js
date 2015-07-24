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
    var callMetricsUrl = '/managedOrgs/callMetrics';
    var registeredUrl = 'trend/managedOrgs/registeredEndpoints';
    var orgId = "&orgId=";
    var dateFormat = "MMM DD, YYYY";
    var mostRecentUpdate = "";
    var customerList = null;

    var overallPopulation = 0;
    var timeFilter = null;
    var activeUserCustomerGraphs = {};

    var mediaQualityUrl = 'modules/core/partnerReports/mediaQuality/mediaQualityFake.json';
    var mediaQualityData = [];

    var callMetricsData = {
      dataProvider: [{
        "callCondition": $translate.instant('callMetrics.callConditionFail'),
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

    var POSITIVE = 'positive';
    var NEGATIVE = 'negative';

    // Promise Tracking
    var ABORT = 'ABORT';
    var TIMEOUT = 'TIMEOUT';
    var activeUserDetailedPromise = null;
    var activeUserCancelPromise = null;
    var activeTableCancelPromise = null;
    var callMetricsCancelPromise = null;
    var endpointsCancelPromise = null;

    return {
      getOverallActiveUserData: getOverallActiveUserData,
      getActiveUserData: getActiveUserData,
      getCustomerList: getCustomerList,
      getMostRecentUpdate: getMostRecentUpdate,
      getMediaQualityMetrics: getMediaQualityMetrics,
      getCallMetricsData: getCallMetricsData,
      getRegisteredEndpoints: getRegisteredEndpoints
    };

    function getOverallActiveUserData(time) {
      timeFilter = time.value;
      var query = getQuery(time);
      activeUserCustomerGraphs = {};
      overallPopulation = 0;

      if (activeUserCancelPromise !== null && activeUserCancelPromise !== undefined) {
        activeUserCancelPromise.resolve(ABORT);
      }
      activeUserCancelPromise = $q.defer();

      activeUserDetailedPromise = getService(detailed + activeUserUrl + query, activeUserCancelPromise).then(function (response) {
        if (response.data !== null && response.data !== undefined && angular.isArray(response.data.data)) {
          var overallActive = 0;
          var overallRegistered = 0;

          angular.forEach(response.data.data, function (customer) {
            // compile the information for both active user bar graphs.
            var graphData = [];
            var populationData = [];
            var totalActive = 0;
            var totalRegistered = 0;

            if (angular.isArray(customer.data)) {
              angular.forEach(customer.data, function (index) {
                index.percentage = Math.round((parseInt(index.details.activeUsers) / parseInt(index.details.totalRegisteredUsers)) * 100);
                index.activeUsers = parseInt(index.details.activeUsers);
                index.totalRegisteredUsers = parseInt(index.details.totalRegisteredUsers);
                index.modifiedDate = moment(index.date).format(dateFormat);

                totalActive += index.activeUsers;
                totalRegistered += index.totalRegisteredUsers;
              });
              graphData = customer.data;

              populationData.push({
                customerId: customer.orgId,
                percentage: Math.round((totalActive / totalRegistered) * 100)
              });
            }

            // save data to be retrieved on a per customer basis
            activeUserCustomerGraphs[customer.orgId] = {
              'graphData': graphData,
              'populationData': populationData
            };

            overallActive += totalActive;
            overallRegistered += totalRegistered;
          });

          // compute overall population percentage for all customers with active users
          overallPopulation = Math.round((overallActive / overallRegistered) * 100);
          return;
        }
        overallPopulation = 0;
      }, function (error) {
        if (error.status !== 0) {
          Log.debug('Loading overall active user population data failed.  Status: ' + error.status + ' Response: ' + error.message);
          Notification.notify([$translate.instant('activeUsers.overallActiveUserGraphError')], 'error');
          timeFilter = null;
          return;
        } else if (error.config.timeout.$$state.status === 0) {
          Log.debug('Loading overall active user population data failed.  Status: ' + error.status);
          Notification.notify([$translate.instant('activeUsers.overallActiveUserGraphError')], 'error');
          timeFilter = null;
          return TIMEOUT;
        } else {
          return ABORT;
        }
      });

      return activeUserDetailedPromise;
    }

    function getActiveUserData(customer, time) {
      var query = getQueryForOnePeriod(time);
      var promises = [];
      var tableData = [];
      var overallStatus = TIMEOUT;
      var overallPromise = null;

      if (time.value !== timeFilter || activeUserDetailedPromise === null) {
        overallPromise = getOverallActiveUserData(time).then(function (response) {
          if (response === ABORT) {
            overallStatus = response;
          }
        });
      } else {
        overallPromise = activeUserDetailedPromise.then(function (response) {
          if (response === ABORT) {
            overallStatus = response;
          }
        });
      }
      promises.push(overallPromise);

      if (activeTableCancelPromise !== null && activeTableCancelPromise !== undefined) {
        activeTableCancelPromise.resolve(ABORT);
      }
      activeTableCancelPromise = $q.defer();
      var tablePromise = getActiveUserTableData(customer, query, activeTableCancelPromise).then(function (response) {
        tableData = response;
      });
      promises.push(tablePromise);

      return $q.all(promises).then(function () {
        if (overallStatus !== ABORT) {
          return {
            graphData: getActiveUserGraphData(customer),
            tableData: tableData,
            populationGraph: getPopulationGraph(customer),
            overallPopulation: overallPopulation
          };
        } else {
          return {
            graphData: ABORT,
            tableData: tableData,
            populationGraph: ABORT,
            overallPopulation: ABORT
          };
        }
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

    function getService(url, canceler) {
      if (canceler === null || canceler === undefined) {
        return $http.get(urlBase + url);
      } else {
        return $http.get(urlBase + url, {
          timeout: canceler.promise
        });
      }
    }

    function getQuery(filter) {
      if (filter.value === 0) {
        return '?&intervalCount=1&intervalType=week&spanCount=1&spanType=day&cache=true';
      } else if (filter.value === 1) {
        return '?&intervalCount=1&intervalType=month&spanCount=7&spanType=day&cache=true';
      } else {
        return '?&intervalCount=3&intervalType=month&spanCount=1&spanType=month&cache=true';
      }
    }

    function getQueryForOnePeriod(filter) {
      if (filter.value === 0) {
        return '?&intervalCount=7&intervalType=day&spanCount=7&spanType=day&cache=true';
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=31&spanType=day&cache=true';
      } else {
        return '?&intervalCount=92&intervalType=day&spanCount=92&spanType=day&cache=true';
      }
    }

    function getTrendQuery(filter) {
      if (filter.value === 0) {
        return '?&intervalCount=1&intervalType=week&spanCount=1&spanType=day&cache=true';
      } else if (filter.value === 1) {
        return '?&intervalCount=1&intervalType=month&spanCount=1&spanType=day&cache=true';
      } else {
        return '?&intervalCount=3&intervalType=month&spanCount=1&spanType=day&cache=true';
      }
    }

    function setMostRecentUpdate(data) {
      if (data.data !== undefined && data.data.date !== null && data.data.date !== undefined) {
        mostRecentUpdate = moment(data.data.date).format(dateFormat);
      }
    }

    function getPopulationGraph(customer) {
      if (angular.isArray(customer)) {
        var data = [];
        angular.forEach(customer, function (item) {
          data.concat(getPopulationGraph(item));
        });
        return data;
      } else if (customer.value === 0) {
        return [];
      } else {
        if (activeUserCustomerGraphs[customer.value] !== null && activeUserCustomerGraphs[customer.value] !== undefined) {
          var graph = activeUserCustomerGraphs[customer.value].populationData;
          graph[0].customerName = customer.label;
          return angular.copy(graph);
        }
        return [{
          customerName: customer.label,
          customerId: customer.value,
          percentage: 0
        }];
      }
    }

    function getActiveUserGraphData(customer) {
      if (angular.isArray(customer)) {
        var graphData = [];
        angular.forEach(customer, function (org) {
          graphData = combineMatchingDates(graphData, getActiveUserGraphData(org));
        });
        return graphData.sort(dateSort);
      } else {
        if (activeUserCustomerGraphs[customer.value] !== null && activeUserCustomerGraphs[customer.value] !== undefined) {
          var customerData = activeUserCustomerGraphs[customer.value].graphData;
          var graph = getDateBase(customerData[customerData.length - 1].modifiedDate);
          return combineMatchingDates(graph, customerData).sort(dateSort);
        }
        return [];
      }
    }

    function dateSort(a, b) {
      if (a.date === b.date) {
        return 0;
      } else if (a.date > b.date) {
        return 1;
      }
      return -1;
    }

    function getDateBase(mostRecent) {
      var graph = [];
      if (timeFilter === 0) {
        var offset = 0;
        if (mostRecent === moment().format(dateFormat)) {
          offset = 1;
        }

        for (var i = 7; i > 0; i--) {
          graph.push({
            date: moment().subtract(i - offset, 'day').format(),
            modifiedDate: moment().subtract(i - offset, 'day').format(dateFormat),
            totalRegisteredUsers: 0,
            activeUsers: 0,
            percentage: 0
          });
        }
      } else if (timeFilter === 1) {
        for (var x = 3; x >= 0; x--) {
          graph.push({
            date: moment(mostRecent).subtract(x * 7, 'day').format(),
            modifiedDate: moment(mostRecent).subtract(x * 7, 'day').format(dateFormat),
            totalRegisteredUsers: 0,
            activeUsers: 0,
            percentage: 0
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          graph.push({
            date: moment().subtract(y, 'month').startOf('month').format(),
            modifiedDate: moment().subtract(y, 'month').startOf('month').format(dateFormat),
            totalRegisteredUsers: 0,
            activeUsers: 0,
            percentage: 0
          });
        }
      }

      return graph;
    }

    function combineMatchingDates(graphData, customerData) {
      angular.forEach(customerData, function (dateData) {
        var updated = false;

        if (graphData.length > 0) {
          for (var i = 0; i < graphData.length; i++) {
            if (graphData[i].modifiedDate.indexOf(dateData.modifiedDate) !== -1) {
              graphData[i].totalRegisteredUsers += dateData.totalRegisteredUsers;
              graphData[i].activeUsers += dateData.activeUsers;
              graphData[i].percentage = Math.round((graphData[i].activeUsers / graphData[i].totalRegisteredUsers) * 100);
              updated = true;
              break;
            }
          }
        }

        if (!updated && dateData.length > 0) {
          graphData.push(angular.copy(dateData));
        }
      });

      return graphData;
    }

    function getActiveUserTableData(customer, query, canceler) {
      if (angular.isArray(customer)) {
        var promises = [];
        var tableData = [];
        angular.forEach(customer, function (org) {
          var promise = getActiveUserTableData(org, query).then(function (response) {
            tableData = tableData.concat(response);
          });
          promises.push(promise);
        });
        return $q.all(promises).then(function () {
          return tableData;
        });
      } else if (customer.value === 0) {
        return $q.when([]);
      } else {
        return getService(topn + activeUserUrl + query + orgId + customer.value, canceler).then(function (response) {
          if (response !== null && response !== undefined) {
            if (mostRecentUpdate === "") {
              setMostRecentUpdate(response);
            }
            return modifyActiveUserTableData(response.data.data[0], customer);
          }
          return [];
        }, function (error) {
          if (error.status !== 0) {
            Log.debug('Loading most active users for customer ' + customer.label + ' failed.  Status: ' + error.status + ' Response: ' + error.message);
            Notification.notify([$translate.instant('activeUsers.activeUserTableError', {
              customer: customer.label
            })], 'error');
            return [];
          } else if (error.config.timeout.$$state.status === 0) {
            Log.debug('Loading most active users for customer ' + customer.label + ' failed.  Status: ' + error.status);
            Notification.notify([$translate.instant('activeUsers.activeUserTableError', {
              customer: customer.label
            })], 'error');
            return [];
          } else {
            return ABORT;
          }
        });
      }
    }

    function modifyActiveUserTableData(data, customer) {
      angular.forEach(data.data, function (index) {
        index.orgName = customer.label;
        index.numCalls = parseInt(index.details.numCalls);
        index.totalActivity = parseInt(index.details.totalActivity);
        index.userId = index.details.userId;
        index.userName = index.details.userName;
      });
      return data.data;
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
        index.modifiedDate = moment(index.date).format(dateFormat);
      });
      return data;
    }

    function getCallMetricsData(customer, time) {
      var query = getQueryForOnePeriod(time);

      if (callMetricsCancelPromise !== null && callMetricsCancelPromise !== undefined) {
        callMetricsCancelPromise.resolve(ABORT);
      }
      callMetricsCancelPromise = $q.defer();

      return getService(detailed + callMetricsUrl + query + orgId + customer.value, callMetricsCancelPromise).then(function (response) {
        if (mostRecentUpdate === "") {
          setMostRecentUpdate(response);
        }

        if (angular.isArray(response.data.data) && response.data.data.length !== 0) {
          return transformRawCallMetricsData(response.data.data[0]);
        } else {
          return [];
        }
      }, function (error) {
        if (error.status !== 0) {
          Log.debug('Loading call metrics data for customer ' + customer.label + ' failed.  Status: ' + error.status + ' Response: ' + error.message);
          Notification.notify([$translate.instant('callMetrics.callMetricsChartError', {
            customer: customer.label
          })], 'error');
          return [];
        } else if (error.config.timeout.$$state.status === 0) {
          Log.debug('Loading call metrics data for customer ' + customer.label + ' failed.  Status: ' + error.status);
          Notification.notify([$translate.instant('activeUsers.callMetricsChartError', {
            customer: customer.label
          })], 'error');
          return [];
        } else {
          return ABORT;
        }
      });
    }

    function transformRawCallMetricsData(data) {
      if (angular.isArray(data.data) && data.data.length !== 0 && data.data[0].details !== undefined && data.data[0].details !== null) {
        var details = data.data[0].details;
        var transformData = angular.copy(callMetricsData);
        // For now, Questionable calls are not counted in the total and it is not part of the chart display.
        var totalCalls = parseInt(details.totalCalls, 10) - parseInt(details.totalQuestionableCalls, 10);

        if (totalCalls < 0) {
          totalCalls = 0;
        }

        transformData.dataProvider[0].numCalls = details.totalFailedCalls;
        transformData.dataProvider[1].numCalls = details.totalSuccessfulCalls;
        transformData.labelData.numTotalCalls = totalCalls;
        transformData.labelData.numTotalMinutes = Math.round(parseFloat(details.totalAudioDuration));
        return transformData;
      } else {
        return [];
      }
    }

    function getRegisteredEndpoints(customer, time) {
      if (endpointsCancelPromise !== null && endpointsCancelPromise !== undefined) {
        endpointsCancelPromise.resolve(ABORT);
      }
      endpointsCancelPromise = $q.defer();

      return retrieveRegisteredEndpoints(customer, time);
    }

    function retrieveRegisteredEndpoints(customer, time) {
      if (angular.isArray(customer)) {
        var returnArray = [];
        var promises = [];

        angular.forEach(customer, function (index) {
          var promise = retrieveRegisteredEndpoints(index, time).then(function (response) {
            returnArray.concat(response);
          });
          promises.push(promise);
        });

        return $q.all(promises).then(function () {
          return returnArray;
        });
      } else {
        return getService(registeredUrl + getTrendQuery(time) + orgId + customer.value, endpointsCancelPromise).then(function (response) {
          if (Array.isArray(response.data.data) && response.data.data[0].details !== null && response.data.data[0].details !== undefined) {
            var data = response.data.data[0].details;
            data.customer = customer.label;

            data.direction = NEGATIVE;
            if (data.registeredDevicesTrend >= 0) {
              data.direction = POSITIVE;
              data.registeredDevicesTrend = "+" + data.registeredDevicesTrend;
            }

            return [data];
          } else {
            return [];
          }
        }, function (error) {
          if (error.status !== 0) {
            Log.debug('Loading regestered endpoints for customer ' + customer.label + ' failed.  Status: ' + error.status + ' Response: ' + error.message);
            Notification.notify([$translate.instant('registeredEndpoints.registeredEndpointsError', {
              customer: customer.label
            })], 'error');
            return [];
          } else if (error.config.timeout.$$state.status === 0) {
            Log.debug('Loading regestered endpoints for customer ' + customer.label + ' failed.  Status: ' + error.status);
            Notification.notify([$translate.instant('registeredEndpoints.registeredEndpointsError', {
              customer: customer.label
            })], 'error');
            return [];
          } else {
            return ABORT;
          }
        });
      }
    }
  }
})();
