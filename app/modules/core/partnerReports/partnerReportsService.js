(function () {
  'use strict';

  angular.module('Core')
    .service('PartnerReportService', PartnerReportService);

  /* @ngInject */
  function PartnerReportService($http, $translate, $q, Config, Authinfo, Notification, Log, PartnerService, chartColors, UrlConfig) {
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
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

    function getOverallActiveUserData(filter) {
      timeFilter = filter.value;
      activeUserCustomerGraphs = {};
      overallPopulation = 0;

      if (activeUserCancelPromise !== null && activeUserCancelPromise !== undefined) {
        activeUserCancelPromise.resolve(ABORT);
      }
      activeUserCancelPromise = $q.defer();

      activeUserDetailedPromise = getService(detailed + activeUserUrl + getQuery(filter), activeUserCancelPromise).then(function (response) {
        if (angular.isDefined(response.data) && angular.isArray(response.data.data)) {
          var overallActive = 0;
          var overallRegistered = 0;

          angular.forEach(response.data.data, function (customer) {
            var customerData = formatActiveUserOrgData(customer, filter);
            activeUserCustomerGraphs[customer.orgId] = customerData;
            overallActive += customerData.totalActive;
            overallRegistered += customerData.totalRegistered;
          });

          // compute overall population percentage for all customers with active users
          overallPopulation = Math.round((overallActive / overallRegistered) * 100);
        }
        return;
      }, function (error) {
        if (error.status !== 0 || error.config.timeout.$$state.status === 0) {
          timeFilter = null;
        }

        return returnErrorCheck(error, 'Loading overall active user population data failed.', $translate.instant('activeUsers.overallActiveUserGraphError'), TIMEOUT);
      });

      return activeUserDetailedPromise;
    }

    function formatActiveUserOrgData(org, filter) {
      var graphData = [];
      var populationData = {};
      var totalActive = 0;
      var totalRegistered = 0;

      if (angular.isArray(org.data)) {
        angular.forEach(org.data, function (item, index, array) {
          var activeUsers = parseInt(item.details.activeUsers);
          var totalRegisteredUsers = parseInt(item.details.totalRegisteredUsers);
          var modifiedDate = moment.tz(item.date, timezone).format(dayFormat);
          if (filter.value > 1) {
            modifiedDate = moment.tz(item.date, timezone).format(monthFormat);
          }

          // fix for when totalRegisteredUsers equals 0 due to errors recording the number
          if (totalRegisteredUsers <= 0) {
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

          if (activeUsers > 0 || totalRegisteredUsers > 0) {
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

      if (!isNaN(Math.round((totalActive / totalRegistered) * 100)) && Math.round((totalActive / totalRegistered) * 100) >= 0) {
        populationData.customerId = org.orgId;
        populationData.percentage = Math.round((totalActive / totalRegistered) * 100);
        populationData.balloon = true;
        populationData.labelColorField = chartColors.grayDarkest;
      }

      return {
        'graphData': graphData,
        'populationData': populationData,
        'totalActive': totalActive,
        'totalRegistered': totalRegistered
      };
    }

    function getActiveUserData(customer, filter) {
      var promises = [];
      var tableData = [];
      var overallStatus = TIMEOUT;
      var overallPromise = null;

      if (filter.value !== timeFilter || activeUserDetailedPromise === null) {
        overallPromise = getOverallActiveUserData(filter).then(function (response) {
          if (response === ABORT) {
            overallStatus = response;
          }
        });
        promises.push(overallPromise);
      }

      var tablePromise = getActiveUserTableData(customer, getQueryForOnePeriod(filter)).then(function (response) {
        tableData = response;
      });
      promises.push(tablePromise);

      return $q.all(promises).then(function () {
        if (overallStatus !== ABORT) {
          return {
            graphData: getActiveUserGraphData(customer, filter),
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

    function getPopulationGraph(customer) {
      if (!angular.isArray(customer)) {
        customer = [customer];
      }

      var returnArray = [];
      angular.forEach(customer, function (org, orgIndex, orgArray) {
        if (angular.isDefined(activeUserCustomerGraphs[org.value])) {
          var popGraph = activeUserCustomerGraphs[org.value].populationData;
          popGraph.customerName = org.label;
          returnArray.push(popGraph);
        } else if (org.value !== 0) {
          returnArray.push({
            customerName: org.label,
            customerId: org.value,
            percentage: 0,
            balloon: true,
            labelColorField: chartColors.grayDarkest
          });
        }
      });
      return returnArray;
    }

    function getActiveUserGraphData(customer, filter) {
      if (!angular.isArray(customer)) {
        customer = [customer];
      }

      var graphItem = {
        totalRegisteredUsers: 0,
        activeUsers: 0,
        percentage: 0,
        colorOne: chartColors.brandSuccessLight,
        colorTwo: chartColors.brandSuccessDark,
        balloon: true
      };
      var date = undefined;
      var dataSet = [];
      angular.forEach(customer, function (org, orgIndex, orgArray) {
        if (angular.isDefined(activeUserCustomerGraphs[org.value])) {
          var orgData = activeUserCustomerGraphs[org.value].graphData;
          dataSet.push(orgData);
          if (angular.isArray(orgData) && (orgData.length > 0) && (angular.isUndefined(date) || orgData[(orgData.length - 1)].date > date)) {
            date = orgData[(orgData.length - 1)].date;
          }
        }
      });
      var dayOffset = 0;
      if (angular.isDefined(date)) {
        dayOffset = parseInt(moment.tz(date, timezone).format('e'));
        if (dayOffset >= 4) {
          dayOffset = 7 - dayOffset;
        } else {
          dayOffset = -dayOffset;
        }
      }

      var baseGraph = getReturnGraph(filter, dayOffset, graphItem);
      var emptyGraph = true;
      angular.forEach(dataSet, function (item, index, array) {
        if (angular.isArray(item) && (item.length > 0)) {
          baseGraph = combineMatchingDates(baseGraph, item);
          emptyGraph = false;
        }
      });

      if (!emptyGraph) {
        return baseGraph;
      }
      return [];
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

    function getActiveUserTableData(customer, query) {
      if (activeTableCancelPromise !== null && activeTableCancelPromise !== undefined) {
        activeTableCancelPromise.resolve(ABORT);
      }
      activeTableCancelPromise = $q.defer();

      var customerIds = getAllowedCustomerUuids(customer);

      if (angular.isUndefined(customerIds)) {
        return $q.when([]);
      } else {
        return getService(topn + activeUserUrl + query + customerIds, activeTableCancelPromise).then(function (response) {
          var tableData = [];
          if (angular.isDefined(response.data) && angular.isArray(response.data.data)) {
            angular.forEach(response.data.data, function (org, orgIndex, orgArray) {
              if (angular.isDefined(org.data)) {
                angular.forEach(org.data, function (item, index, array) {
                  tableData.push({
                    orgName: org.orgName,
                    numCalls: parseInt(item.details.numCalls),
                    totalActivity: parseInt(item.details.totalActivity),
                    sparkMessages: parseInt(item.details.totalActivity) - parseInt(item.details.numCalls),
                    userName: item.details.userName
                  });
                });
              }
            });
          }
          return tableData;
        }, function (error) {
          return returnErrorCheck(error, 'Loading most active users for the selected customer(s) failed.', $translate.instant('activeUsers.activeUserTableError'), []);
        });
      }
    }

    function getMediaQualityMetrics(customer, filter) {
      if (qualityCancelPromise !== null && qualityCancelPromise !== undefined) {
        qualityCancelPromise.resolve(ABORT);
      }
      qualityCancelPromise = $q.defer();

      return getService(detailed + qualityUrl + getQuery(filter) + getCustomerUuids(customer), qualityCancelPromise).then(function (response) {
        if (angular.isDefined(response.data) && angular.isArray(response.data.data)) {
          var graphItem = {
            totalDurationSum: 0,
            goodQualityDurationSum: 0,
            fairQualityDurationSum: 0,
            poorQualityDurationSum: 0,
            partialSum: 0,
            balloon: true
          };
          var date = undefined;
          angular.forEach(response.data.data, function (offset, offsetIndex, offsetArray) {
            if (angular.isArray(offset.data) && (angular.isUndefined(date) || offset.data[(offset.data.length - 1)].date)) {
              date = offset.data[(offset.data.length - 1)].date;
            }
          });
          var dayOffset = parseInt(moment.tz(date, timezone).format('e'));
          if (dayOffset >= 4) {
            dayOffset = 7 - dayOffset;
          } else {
            dayOffset = -dayOffset;
          }
          var baseGraph = getReturnGraph(filter, dayOffset, graphItem);
          var graphUpdated = false;

          angular.forEach(response.data.data, function (org, orgIndex, orgArray) {
            if (angular.isArray(org.data)) {
              var graph = parseMediaQualityData(org, filter);
              if (graph.length > 0) {
                baseGraph = combineQualityGraphs(baseGraph, graph);
                graphUpdated = true;
              }
            }
          });

          if (graphUpdated) {
            return baseGraph;
          }
        }
        return [];
      }, function (error) {
        return returnErrorCheck(error, 'Loading call quality data for the selected customer(s) failed.', $translate.instant('mediaQuality.mediaQualityGraphError'), []);
      });
    }

    function parseMediaQualityData(org, filter) {
      var graph = [];
      angular.forEach(org.data, function (item, index, array) {
        if (angular.isDefined(item.details)) {
          var totalSum = parseInt(item.details.totalDurationSum);
          var goodSum = parseInt(item.details.goodQualityDurationSum);
          var fairSum = parseInt(item.details.fairQualityDurationSum);
          var poorSum = parseInt(item.details.poorQualityDurationSum);
          var partialSum = fairSum + poorSum;

          if (totalSum > 0) {
            var modifiedDate = moment.tz(item.date, timezone).format(monthFormat);
            if (filter.value === 0 || filter.value === 1) {
              modifiedDate = moment.tz(item.date, timezone).format(dayFormat);
            }

            graph.push({
              totalDurationSum: totalSum,
              goodQualityDurationSum: goodSum,
              fairQualityDurationSum: fairSum,
              poorQualityDurationSum: poorSum,
              partialSum: partialSum,
              modifiedDate: modifiedDate
            });
          }
        }
      });
      return graph;
    }

    function combineQualityGraphs(baseGraph, graph) {
      angular.forEach(graph, function (graphItem, graphIndex, graphArray) {
        angular.forEach(baseGraph, function (baseGraphItem, baseGraphIndex, baseGraphArray) {
          if (graphItem.modifiedDate === baseGraphItem.modifiedDate) {
            baseGraphItem.totalDurationSum += graphItem.totalDurationSum;
            baseGraphItem.goodQualityDurationSum += graphItem.goodQualityDurationSum;
            baseGraphItem.fairQualityDurationSum += graphItem.fairQualityDurationSum;
            baseGraphItem.poorQualityDurationSum += graphItem.poorQualityDurationSum;
            baseGraphItem.partialSum += graphItem.partialSum;
          }
        });
      });
      return baseGraph;
    }

    function getCallMetricsData(customer, time) {
      if (callMetricsCancelPromise !== null && callMetricsCancelPromise !== undefined) {
        callMetricsCancelPromise.resolve(ABORT);
      }
      callMetricsCancelPromise = $q.defer();
      var returnArray = {
        dataProvider: [],
        displayData: {}
      };

      return getService(detailed + callMetricsUrl + getQueryForOnePeriod(time) + getCustomerUuids(customer), callMetricsCancelPromise).then(function (response) {
        if (angular.isDefined(response.data) && angular.isArray(response.data.data)) {
          var transformDataSet = false;
          var transformData = {
            dataProvider: [{
              "label": $translate.instant('callMetrics.callConditionFail'),
              "value": 0,
              "color": chartColors.grayDarkest
            }, {
              "label": $translate.instant('callMetrics.callConditionSuccessful'),
              "value": 0,
              "color": chartColors.brandInfo
            }],
            labelData: {
              "numTotalCalls": 0,
              "numTotalMinutes": 0
            }
          };

          angular.forEach(response.data.data, function (item, index, array) {
            if (angular.isDefined(item.data) && angular.isArray(item.data) && angular.isDefined(item.data[0].details) && (item.data[0].details !== null)) {
              var details = item.data[0].details;
              var totalCalls = parseInt(details.totalCalls);

              if (totalCalls > 0) {
                transformData.labelData.numTotalCalls += totalCalls;
                transformData.labelData.numTotalMinutes += Math.round(parseFloat(details.totalAudioDuration));
                transformData.dataProvider[0].value += parseInt(details.totalFailedCalls);
                transformData.dataProvider[1].value += parseInt(details.totalSuccessfulCalls);
                transformDataSet = true;
              }
            }
          });
          if (transformDataSet) {
            return transformData;
          }
        }
        return returnArray;
      }, function (error) {
        return returnErrorCheck(error, 'Loading call metrics data for selected customers failed.', $translate.instant('callMetrics.callMetricsChartError'), returnArray);
      });
    }

    function getRegisteredEndpoints(customer, time) {
      if (endpointsCancelPromise !== null && endpointsCancelPromise !== undefined) {
        endpointsCancelPromise.resolve(ABORT);
      }
      endpointsCancelPromise = $q.defer();

      return getService(registeredUrl + getTrendQuery(time) + getCustomerUuids(customer), endpointsCancelPromise).then(function (response) {
        var returnArray = [];
        if (angular.isDefined(response.data) && angular.isArray(response.data.data)) {
          angular.forEach(response.data.data, function (item, index, array) {
            if (angular.isDefined(item.details) && (item.details !== null)) {
              var returnObject = item.details;
              returnObject.customer = getCustomerName(customer, returnObject.orgId);

              returnObject.direction = NEGATIVE;
              if ((returnObject.registeredDevicesTrend === "NaN")) {
                returnObject.direction = POSITIVE;
                returnObject.registeredDevicesTrend = "+0.0";
              } else if (returnObject.registeredDevicesTrend >= 0) {
                returnObject.direction = POSITIVE;
                returnObject.registeredDevicesTrend = "+" + returnObject.registeredDevicesTrend;
              }
              returnArray.push(returnObject);
            }
          });
        }
        return returnArray;
      }, function (error) {
        return returnErrorCheck(error, 'Loading registered endpoints for the selected customer(s) failed.', $translate.instant('registeredEndpoints.registeredEndpointsError'), []);
      });
    }

    function getCustomerName(customer, uuid) {
      if (angular.isArray(customer)) {
        var customerName = "";
        angular.forEach(customer, function (org, orgIndex, orgArray) {
          if (org.value === uuid) {
            customerName = org.label;
          }
        });
        return customerName;
      } else {
        return customer.label;
      }
    }

    function getCustomerUuids(customer) {
      var url = "";
      if (angular.isArray(customer)) {
        angular.forEach(customer, function (item, index, array) {
          url += orgId + item.value;
        });
      } else {
        url = orgId + customer.value;
      }
      return url;
    }

    function getAllowedCustomerUuids(customer) {
      var url = undefined;
      if (angular.isArray(customer)) {
        angular.forEach(customer, function (item, index, array) {
          if (item.isAllowedToManage && angular.isDefined(url)) {
            url += orgId + item.value;
          } else {
            url = orgId + item.value;
          }
        });
      } else if (customer.isAllowedToManage && customer.value !== 0) {
        url = orgId + customer.value;
      }
      return url;
    }

    function getReturnGraph(filter, dayOffset, graphItem) {
      var returnGraph = [];

      if (filter.value === 0) {
        for (var i = 6; i >= 0; i--) {
          var tmpItem = angular.copy(graphItem);
          tmpItem.modifiedDate = moment().tz(timezone).subtract(i + 1, 'day').format(dayFormat);
          returnGraph.push(tmpItem);
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          var temp = angular.copy(graphItem);
          temp.modifiedDate = moment().tz(timezone).startOf('week').subtract(dayOffset + (x * 7), 'day').format(dayFormat);
          returnGraph.push(temp);
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          var item = angular.copy(graphItem);
          item.modifiedDate = moment().tz(timezone).subtract(y, 'month').startOf('month').format(monthFormat);
          returnGraph.push(item);
        }
      }

      return returnGraph;
    }

    function returnErrorCheck(error, debug, message, returnItem) {
      if (error.status === 401 || error.status === 403) {
        Log.debug('User not authorized to access reports.  Status: ' + error.status);
        Notification.notify([$translate.instant('reportsPage.unauthorizedError')], 'error');
        return returnItem;
      } else if ((error.status > 0) || (error.config.timeout.$$state.value !== ABORT)) {
        if (error.status > 0) {
          Log.debug(debug + '  Status: ' + error.status + ' Response: ' + error.message);
        } else {
          Log.debug(debug + '  Status: ' + error.status);
        }
        if ((error.data !== null) && angular.isDefined(error.data) && angular.isDefined(error.data.trackingId) && (error.data.trackingId !== null)) {
          Notification.notify([message + '<br>' + $translate.instant('reportsPage.trackingId') + error.data.trackingId], 'error');
        } else {
          Notification.notify([message], 'error');
        }
        return returnItem;
      } else {
        return ABORT;
      }
    }

    function getQuery(filter, cacheOption) {
      if (cacheOption === null || angular.isUndefined(cacheOption)) {
        cacheOption = cacheValue;
      }
      if (filter.value === 0) {
        return '?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheOption;
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=7&spanType=day&cache=' + cacheOption;
      } else {
        return '?&intervalCount=3&intervalType=month&spanCount=1&spanType=month&cache=' + cacheOption;
      }
    }

    function getQueryForOnePeriod(filter, cacheOption) {
      if (cacheOption === null || angular.isUndefined(cacheOption)) {
        cacheOption = cacheValue;
      }
      if (filter.value === 0) {
        return '?&intervalCount=7&intervalType=day&spanCount=7&spanType=day&cache=' + cacheOption;
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=31&spanType=day&cache=' + cacheOption;
      } else {
        return '?&intervalCount=92&intervalType=day&spanCount=92&spanType=day&cache=' + cacheOption;
      }
    }

    function getTrendQuery(filter, cacheOption) {
      if (cacheOption === null || angular.isUndefined(cacheOption)) {
        cacheOption = cacheValue;
      }
      if (filter.value === 0) {
        return '?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheOption;
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=1&spanType=day&cache=' + cacheOption;
      } else {
        return '?&intervalCount=92&intervalType=day&spanCount=1&spanType=day&cache=' + cacheOption;
      }
    }
  }
})();
