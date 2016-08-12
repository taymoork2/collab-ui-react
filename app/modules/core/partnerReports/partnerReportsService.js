(function () {
  'use strict';

  angular.module('Core')
    .service('PartnerReportService', PartnerReportService);

  /* @ngInject */
  function PartnerReportService($http, $translate, $q, Authinfo, Notification, Log, PartnerService, chartColors, UrlConfig) {
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    var detailed = 'detailed';
    var topn = 'topn';
    var activeUserUrl = '/managedOrgs/activeUsers';
    var callMetricsUrl = '/managedOrgs/callMetrics';
    var qualityUrl = '/managedOrgs/callQuality';
    var registeredUrl = 'trend/managedOrgs/registeredEndpoints';
    var orgId = "&orgId=";
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var timezone = "Etc/GMT";
    var cacheValue = (parseInt(moment.utc().format('H'), 10) >= 8);

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
      getActiveTableData: getActiveTableData,
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
          var activeUsers = parseInt(item.details.activeUsers, 10);
          var totalRegisteredUsers = parseInt(item.details.totalRegisteredUsers, 10);
          var modifiedDate = moment.tz(item.date, timezone).format(dayFormat);
          if (filter.value > 1) {
            modifiedDate = moment.tz(item.date, timezone).format(monthFormat);
          }

          // fix for when totalRegisteredUsers equals 0 due to errors recording the number
          if (totalRegisteredUsers <= 0) {
            var previousTotal = 0;
            var nextTotal = 0;
            if (index !== 0) {
              previousTotal = parseInt(array[index - 1].details.totalRegisteredUsers, 10);
            }
            if (index < (array.length - 1)) {
              nextTotal = parseInt(array[index + 1].details.totalRegisteredUsers, 10);
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
      var overallStatus = TIMEOUT;
      var promise = null;

      if (filter.value !== timeFilter || activeUserDetailedPromise === null) {
        promise = getOverallActiveUserData(filter).then(function (response) {
          if (response === ABORT) {
            overallStatus = response;
          }
        });
      } else {
        promise = activeUserDetailedPromise;
      }

      return promise.then(function () {
        if (overallStatus !== ABORT) {
          return getActiveGraphData(customer, filter);
        } else {
          return {
            graphData: ABORT,
            isActiveUsers: false,
            popData: ABORT,
            overallPopulation: ABORT
          };
        }
      });
    }

    function getCustomerList() {
      return PartnerService.getManagedOrgsList()
        .catch(function (err) {
          Log.debug('Failed to retrieve managed orgs information. Status: ' + err.status);
          Notification.error('reportsPage.customerLoadError');
          $q.reject([]);
        })
        .then(function (response) {
          return _.get(response, 'data.organizations', []);
        });
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

    function getActiveGraphData(customer, filter) {
      if (!angular.isArray(customer)) {
        customer = [customer];
      }

      var returnData = {
        graphData: [],
        popData: [],
        isActiveUsers: false,
        overallPopulation: overallPopulation
      };

      var graphItem = {
        totalRegisteredUsers: 0,
        activeUsers: 0,
        percentage: 0,
        colorOne: chartColors.brandSuccessLight,
        colorTwo: chartColors.brandSuccessDark,
        balloon: true
      };
      var date = undefined;
      var activeDataSet = [];
      angular.forEach(customer, function (org) {
        var orgData = activeUserCustomerGraphs[org.value];
        var emptyPopGraph = {
          customerName: org.label,
          customerId: org.value,
          percentage: 0,
          balloon: true,
          labelColorField: chartColors.grayDarkest
        };
        if (angular.isDefined(orgData)) {
          // gather active user data for combining below
          var orgActive = orgData.graphData;
          activeDataSet.push(orgActive);
          if (angular.isArray(orgActive) && (orgActive.length > 0) && (angular.isUndefined(date) || orgActive[(orgActive.length - 1)].date > date)) {
            date = orgActive[(orgActive.length - 1)].date;
          }

          // Pre-determine if the most active user table will be populated
          if (orgData.totalActive > 0) {
            returnData.isActiveUsers = true;
          }

          // add to the combined population graph
          var popGraph = activeUserCustomerGraphs[org.value].populationData;
          if (angular.isUndefined(popGraph.balloon)) {
            popGraph = emptyPopGraph;
          } else {
            popGraph.customerName = org.label;
          }
          returnData.popData.push(popGraph);
        } else if (org.value !== 0) {
          // create placeholder for the combined population graph
          returnData.popData.push(emptyPopGraph);
        }
      });
      var dayOffset = 0;
      if (angular.isDefined(date)) {
        dayOffset = parseInt(moment.tz(date, timezone).format('e'), 10);
        if (dayOffset >= 4) {
          dayOffset = 7 - dayOffset;
        } else {
          dayOffset = -dayOffset;
        }
      }

      // combine the active user data into a single graph
      var baseGraph = getReturnGraph(filter, dayOffset, graphItem);
      var emptyGraph = true;
      angular.forEach(activeDataSet, function (item) {
        if (angular.isArray(item) && (item.length > 0)) {
          baseGraph = combineMatchingDates(baseGraph, item);
          emptyGraph = false;
        }
      });
      if (!emptyGraph) {
        returnData.graphData = baseGraph;
      }

      return returnData;
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

    function getActiveTableData(customer, filter) {
      if (activeTableCancelPromise !== null && activeTableCancelPromise !== undefined) {
        activeTableCancelPromise.resolve(ABORT);
      }
      activeTableCancelPromise = $q.defer();

      var customerIds = getAllowedCustomerUuids(customer);

      if (angular.isUndefined(customerIds)) {
        return $q.when([]);
      } else {
        var query = "?reportType=weeklyUsage&cache=";
        if (filter.value === 1) {
          query = "?reportType=monthlyUsage&cache=";
        } else if (filter.value === 2) {
          query = "?reportType=threeMonthUsage&cache=";
        }
        return getService(topn + activeUserUrl + query + cacheValue + customerIds, activeTableCancelPromise).then(function (response) {
          var tableData = [];
          if (response.data && angular.isArray(response.data.data)) {
            angular.forEach(response.data.data, function (org) {
              if (org.data) {
                angular.forEach(org.data, function (item) {
                  tableData.push({
                    orgName: org.orgName,
                    numCalls: parseInt(item.details.sparkCalls, 10) + parseInt(item.details.sparkUcCalls, 10),
                    totalActivity: parseInt(item.details.totalActivity, 10),
                    sparkMessages: parseInt(item.details.sparkMessages, 10),
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
          angular.forEach(response.data.data, function (offset) {
            if (angular.isArray(offset.data) && (angular.isUndefined(date) || offset.data[(offset.data.length - 1)].date)) {
              date = offset.data[(offset.data.length - 1)].date;
            }
          });
          var dayOffset = parseInt(moment.tz(date, timezone).format('e'), 10);
          if (dayOffset >= 4) {
            dayOffset = 7 - dayOffset;
          } else {
            dayOffset = -dayOffset;
          }
          var baseGraph = getReturnGraph(filter, dayOffset, graphItem);
          var graphUpdated = false;

          angular.forEach(response.data.data, function (org) {
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
      angular.forEach(org.data, function (item) {
        if (angular.isDefined(item.details)) {
          var totalSum = parseInt(item.details.totalDurationSum, 10);
          var goodSum = parseInt(item.details.goodQualityDurationSum, 10);
          var fairSum = parseInt(item.details.fairQualityDurationSum, 10);
          var poorSum = parseInt(item.details.poorQualityDurationSum, 10);
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
      angular.forEach(graph, function (graphItem) {
        angular.forEach(baseGraph, function (baseGraphItem) {
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

          angular.forEach(response.data.data, function (item) {
            if (angular.isDefined(item.data) && angular.isArray(item.data) && angular.isDefined(item.data[0].details) && (item.data[0].details !== null)) {
              var details = item.data[0].details;
              var totalCalls = parseInt(details.totalCalls, 10);

              if (totalCalls > 0) {
                transformData.labelData.numTotalCalls += totalCalls;
                transformData.labelData.numTotalMinutes += Math.round(parseFloat(details.totalAudioDuration));
                transformData.dataProvider[0].value += parseInt(details.totalFailedCalls, 10);
                transformData.dataProvider[1].value += parseInt(details.totalSuccessfulCalls, 10);
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
          angular.forEach(response.data.data, function (item) {
            if (angular.isDefined(item.details) && (item.details !== null)) {
              var returnObject = item.details;
              returnObject.customer = getCustomerName(customer, returnObject.orgId);

              returnObject.direction = NEGATIVE;
              if ((returnObject.registeredDevicesTrend === "NaN")) {
                returnObject.direction = POSITIVE;
                returnObject.registeredDevicesTrend = "+0.0%";
              } else if (returnObject.registeredDevicesTrend >= 0) {
                returnObject.direction = POSITIVE;
                returnObject.registeredDevicesTrend = "+" + returnObject.registeredDevicesTrend + "%";
              } else {
                returnObject.registeredDevicesTrend += "%";
              }
              returnArray.push(returnObject);
            }
          });
        }
        if (0 < returnArray.length < customer.length) {
          angular.forEach(customer, function (org) {
            var emptyOrg = true;
            angular.forEach(returnArray, function (object) {
              if (object.orgId === org.value) {
                emptyOrg = false;
              }
            });
            if (emptyOrg) {
              returnArray.push({
                "orgId": org.value,
                "deviceRegistrationCountTrend": "-",
                "yesterdaysDeviceRegistrationCount": "-",
                "registeredDevicesTrend": "-",
                "yesterdaysRegisteredDevices": "-",
                "maxRegisteredDevices": "-",
                "minRegisteredDevices": "-",
                "customer": org.label,
                "direction": ""
              });
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
        angular.forEach(customer, function (org) {
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
        angular.forEach(customer, function (item) {
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
        angular.forEach(customer, function (item) {
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
          temp.modifiedDate = moment().tz(timezone)
            .startOf('week')
            .subtract(dayOffset + (x * 7), 'day')
            .format(dayFormat);
          returnGraph.push(temp);
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          var item = angular.copy(graphItem);
          item.modifiedDate = moment().tz(timezone)
            .subtract(y, 'month')
            .startOf('month')
            .format(monthFormat);
          returnGraph.push(item);
        }
      }

      return returnGraph;
    }

    function returnErrorCheck(error, debug, message, returnItem) {
      if (error.status === 401 || error.status === 403) {
        Log.debug('User not authorized to access reports.  Status: ' + error.status);
        Notification.error('reportsPage.unauthorizedError');
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
