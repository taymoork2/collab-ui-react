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
    var qualityUrl = '/managedOrgs/callQuality';
    var registeredUrl = 'trend/managedOrgs/registeredEndpoints';
    var orgId = "&orgId=";
    var dateFormat = "MMM DD, YYYY";
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var timezone = "Etc/GMT";
    var customerList = null;
    var cacheValue = (parseInt(moment.utc().format('H')) >= 8);

    var overallPopulation = 0;
    var timeFilter = null;
    var activeUserCustomerGraphs = {};

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
    var qualityCancelPromise = null;

    return {
      getOverallActiveUserData: getOverallActiveUserData,
      getActiveUserData: getActiveUserData,
      getCustomerList: getCustomerList,
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
              angular.forEach(customer.data, function (item, index, array) {
                var activeUsers = parseInt(item.details.activeUsers);
                var totalRegisteredUsers = parseInt(item.details.totalRegisteredUsers);

                // temporary fix for when totalRegisteredUsers equals -1 due to errors recording the number 
                if (totalRegisteredUsers < 0) {
                  var previousTotal = 0;
                  var nextTotal = 0;
                  if (index !== 0) {
                    previousTotal = parseInt(array[index - 1].details.totalRegisteredUsers);
                  }
                  if (index < (array.length - 1)) {
                    nextTotal = parseInt(array[index + 1].details.totalRegisteredUsers);
                  }

                  if (previousTotal < activeUsers && nextTotal < activeUsers) {
                    totalRegisteredUsers = activeUsers;
                  } else if (previousTotal > nextTotal) {
                    totalRegisteredUsers = previousTotal;
                  } else {
                    totalRegisteredUsers = nextTotal;
                  }
                }

                if (activeUsers !== 0 || totalRegisteredUsers !== 0) {
                  var modifiedDate = moment.tz(item.date, timezone).add(1, 'day').format(monthFormat);
                  if (time.value === 0 || time.value === 1) {
                    modifiedDate = moment.tz(item.date, timezone).add(1, 'day').format(dayFormat);
                  }

                  graphData.push({
                    activeUsers: activeUsers,
                    totalRegisteredUsers: totalRegisteredUsers,
                    percentage: Math.round((activeUsers / totalRegisteredUsers) * 100),
                    modifiedDate: modifiedDate,
                    date: item.date
                  });

                  totalActive += activeUsers;
                  totalRegistered += totalRegisteredUsers;
                }
              });
            }

            if (!isNaN(Math.round((totalActive / totalRegistered) * 100)) && Math.round((totalActive / totalRegistered) * 100) > 0) {
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
        if (error.status !== 0 || error.config.timeout.$$state.status === 0) {
          timeFilter = null;
        }

        var errorMessage = $translate.instant('activeUsers.overallActiveUserGraphError');
        return returnErrorCheck(error, 'Loading overall active user population data failed.', errorMessage, TIMEOUT);
      });

      return activeUserDetailedPromise;
    }

    function returnErrorCheck(error, debug, message, returnItem) {
      if (error.status === 401 || error.status === 403) {
        Log.debug('User not authorized to access reports.  Status: ' + error.status);
        Notification.notify([$translate.instant('reportsPage.unauthorizedError')], 'error');
        return returnItem;
      } else if (error.status !== 0) {
        Log.debug(debug + '  Status: ' + error.status + ' Response: ' + error.message);
        Notification.notify([message], 'error');
        return returnItem;
      } else if (error.config.timeout.$$state.status === 0) {
        Log.debug(debug + '  Status: ' + error.status);
        Notification.notify([message], 'error');
        return returnItem;
      } else {
        return ABORT;
      }
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
            graphData: getActiveUserGraphData(customer, time),
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
        return '?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=7&spanType=day&cache=' + cacheValue;
      } else {
        return '?&intervalCount=3&intervalType=month&spanCount=1&spanType=month&cache=' + cacheValue;
      }
    }

    function getQueryForOnePeriod(filter) {
      if (filter.value === 0) {
        return '?&intervalCount=7&intervalType=day&spanCount=7&spanType=day&cache=' + cacheValue;
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=31&spanType=day&cache=' + cacheValue;
      } else {
        return '?&intervalCount=92&intervalType=day&spanCount=92&spanType=day&cache=' + cacheValue;
      }
    }

    function getTrendQuery(filter) {
      if (filter.value === 0) {
        return '?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;
      } else {
        return '?&intervalCount=92&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;
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
        if (activeUserCustomerGraphs[customer.value] !== null && activeUserCustomerGraphs[customer.value] !== undefined && activeUserCustomerGraphs[customer.value].populationData.length > 0) {
          var graph = activeUserCustomerGraphs[customer.value].populationData;
          graph[0].customerName = customer.label;
          return angular.copy(graph);
        }
        return [];
      }
    }

    function getActiveUserGraphData(customer, time) {
      if (angular.isArray(customer)) {
        var graphData = [];
        angular.forEach(customer, function (org) {
          graphData = combineMatchingDates(graphData, getActiveUserGraphData(org, time));
        });
        return graphData;
      } else {
        if (activeUserCustomerGraphs[customer.value] !== null && activeUserCustomerGraphs[customer.value] !== undefined && activeUserCustomerGraphs[customer.value].graphData.length > 0) {
          var customerData = activeUserCustomerGraphs[customer.value].graphData;
          var baseDate = moment.tz(customerData[customerData.length - 1].date, timezone).format(dateFormat);
          var graph = getDateBase(time, [Config.chartColors.brandSuccessLight, Config.chartColors.brandSuccessDark], baseDate);
          return combineMatchingDates(graph, customerData);
        }
        return [];
      }
    }

    function getDateBase(time, colors, mostRecent) {
      var graph = [];
      var dataPoint = {
        totalRegisteredUsers: 0,
        activeUsers: 0,
        percentage: 0,
        totalDurationSum: 0,
        goodQualityDurationSum: 0,
        fairQualityDurationSum: 0,
        poorQualityDurationSum: 0,
        balloon: true,
        colorOne: colors[0],
        colorTwo: colors[1]
      };

      if (time.value === 0) {
        var offset = 1;
        if (moment.tz(mostRecent, timezone).format(dayFormat) === moment().tz(timezone).format(dayFormat)) {
          offset = 0;
        }

        for (var i = 6; i >= 0; i--) {
          dataPoint.modifiedDate = moment().tz(timezone).subtract(i + offset, 'day').format(dayFormat);
          dataPoint.date = moment().tz(timezone).subtract(i + offset, 'day').format();
          graph.push(angular.copy(dataPoint));
        }
      } else if (time.value === 1) {
        var dayOffset = parseInt(moment.tz(mostRecent, timezone).format('e'));
        if (dayOffset >= 4) {
          dayOffset = 7 - dayOffset;
        } else {
          dayOffset = -dayOffset;
        }

        for (var x = 3; x >= 0; x--) {
          dataPoint.modifiedDate = moment().tz(timezone).startOf('week').subtract(dayOffset + (x * 7), 'day').format(dayFormat);
          dataPoint.date = moment().tz(timezone).startOf('week').subtract(dayOffset + (x * 7), 'day').format();
          graph.push(angular.copy(dataPoint));
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          dataPoint.modifiedDate = moment().tz(timezone).subtract(y, 'month').startOf('month').format(monthFormat);
          dataPoint.date = moment().tz(timezone).subtract(y, 'month').startOf('month').format();
          graph.push(angular.copy(dataPoint));
        }
      }

      return graph;
    }

    function combineMatchingDates(graphData, customerData) {
      angular.forEach(customerData, function (dateData) {
        if (graphData.length > 0) {
          for (var i = 0; i < graphData.length; i++) {
            if (graphData[i].modifiedDate.indexOf(dateData.modifiedDate) !== -1) {
              graphData[i].totalRegisteredUsers += dateData.totalRegisteredUsers;
              graphData[i].activeUsers += dateData.activeUsers;
              graphData[i].percentage = Math.round((graphData[i].activeUsers / graphData[i].totalRegisteredUsers) * 100);
              break;
            }
          }
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
            var data = response.data.data[0].data;
            angular.forEach(data, function (index) {
              if (angular.isDefined(index.details)) {
                index.orgName = customer.label;
                index.numCalls = parseInt(index.details.numCalls);
                index.totalActivity = parseInt(index.details.totalActivity);
                index.userId = index.details.userId;
                index.userName = index.details.userName;
              }
            });
            return data;
          }
          return [];
        }, function (error) {
          var errorMessage = $translate.instant('activeUsers.activeUserTableError', {
            customer: customer.label
          });
          return returnErrorCheck(error, 'Loading most active users for customer ' + customer.label + ' failed.', errorMessage, []);
        });
      }
    }

    function getMediaQualityMetrics(customer, time) {
      var query = getQuery(time);
      if (qualityCancelPromise !== null && qualityCancelPromise !== undefined) {
        qualityCancelPromise.resolve(ABORT);
      }
      qualityCancelPromise = $q.defer();

      return getService(detailed + qualityUrl + query + orgId + customer.value, qualityCancelPromise).then(function (response) {
        if (response !== null && response !== undefined) {
          if (response.data.data.length > 0) {
            var graph = [];
            angular.forEach(response.data.data[0].data, function (index) {
              var totalSum = parseInt(index.details.totalDurationSum);
              var goodSum = parseInt(index.details.goodQualityDurationSum);
              var fairSum = parseInt(index.details.fairQualityDurationSum);
              var poorSum = parseInt(index.details.poorQualityDurationSum);

              if (totalSum > 0 || goodSum > 0 || fairSum > 0 || poorSum > 0) {
                var modifiedDate = moment.tz(index.date, timezone).format(monthFormat);
                if (time.value === 0 || time.value === 1) {
                  modifiedDate = moment.tz(index.date, timezone).format(dayFormat);
                }

                graph.push({
                  totalDurationSum: totalSum,
                  goodQualityDurationSum: goodSum,
                  fairQualityDurationSum: fairSum,
                  poorQualityDurationSum: poorSum,
                  modifiedDate: modifiedDate,
                  date: index.date
                });
              }
            });

            if (graph.length > 0) {
              var graphBase = getDateBase(time, [], moment.tz(graph[graph.length - 1].date, timezone).format(dateFormat));
              angular.forEach(graph, function (index) {
                graphBase = combineQualityGraphs(graphBase, index);
              });

              if (time.value === 0) {
                graphBase = setDates(graphBase);
              }

              return graphBase;
            }
          }
          return [];
        }
      }, function (error) {
        var errorMessage = $translate.instant('mediaQuality.mediaQualityGraphError', {
          customer: customer.label
        });
        return returnErrorCheck(error, 'Loading call quality data for customer ' + customer.label + ' failed.', errorMessage, []);
      });
    }

    function setDates(graphData) {
      angular.forEach(graphData, function (item, index, array) {
        var date = moment.tz(item.date, timezone).subtract(1, 'day').format();
        item.modifiedDate = moment.tz(date, timezone).format(dayFormat);
      });

      return graphData;
    }

    function combineQualityGraphs(graph, option) {
      angular.forEach(graph, function (index) {
        if (index.modifiedDate === option.modifiedDate) {
          index.totalDurationSum += option.totalDurationSum;
          index.goodQualityDurationSum += option.goodQualityDurationSum;
          index.fairQualityDurationSum += option.fairQualityDurationSum;
          index.poorQualityDurationSum += option.poorQualityDurationSum;
        }
      });
      return graph;
    }

    function getCallMetricsData(customer, time) {
      var query = getQueryForOnePeriod(time);

      if (callMetricsCancelPromise !== null && callMetricsCancelPromise !== undefined) {
        callMetricsCancelPromise.resolve(ABORT);
      }
      callMetricsCancelPromise = $q.defer();

      return getService(detailed + callMetricsUrl + query + orgId + customer.value, callMetricsCancelPromise).then(function (response) {
        if (angular.isArray(response.data.data) && response.data.data.length !== 0) {
          return transformRawCallMetricsData(response.data.data[0]);
        } else {
          return [];
        }
      }, function (error) {
        var errorMessage = $translate.instant('callMetrics.callMetricsChartError', {
          customer: customer.label
        });
        return returnErrorCheck(error, 'Loading call metrics data for customer ' + customer.label + ' failed.', errorMessage, []);
      });
    }

    function transformRawCallMetricsData(data) {
      if (angular.isArray(data.data) && data.data.length !== 0 && data.data[0].details !== undefined && data.data[0].details !== null) {
        var details = data.data[0].details;
        var transformData = angular.copy(callMetricsData);
        var totalCalls = parseInt(details.totalCalls);

        if (totalCalls > 0) {
          transformData.labelData.numTotalCalls = totalCalls;
          transformData.labelData.numTotalMinutes = Math.round(parseFloat(details.totalAudioDuration));
          transformData.dataProvider[0].numCalls = parseInt(details.totalFailedCalls);
          transformData.dataProvider[1].numCalls = parseInt(details.totalSuccessfulCalls);
          return transformData;
        }
      }
      return [];
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
            if (data.registeredDevicesTrend === "NaN") {
              data.direction = POSITIVE;
              data.registeredDevicesTrend = 0;
            } else if (data.registeredDevicesTrend >= 0) {
              data.direction = POSITIVE;
              data.registeredDevicesTrend = "+" + data.registeredDevicesTrend;
            }

            return [data];
          } else {
            return [];
          }
        }, function (error) {
          var errorMessage = $translate.instant('registeredEndpoints.registeredEndpointsError', {
            customer: customer.label
          });
          return returnErrorCheck(error, 'Loading registered endpoints for customer ' + customer.label + ' failed.', errorMessage, []);
        });
      }
    }
  }
})();
