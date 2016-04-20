(function () {
  'use strict';

  angular.module('Core')
    .service('CustomerReportService', CustomerReportService);

  /* @ngInject */
  function CustomerReportService($http, $translate, $q, Config, Authinfo, Notification, Log, chartColors, UrlConfig) {
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    var detailed = 'detailed';
    var topn = 'topn';
    var timechart = 'timeCharts';
    var activeUserUrl = '/activeUsers';
    var groupUrl = '/conversations';
    var oneToOneUrl = '/convOneOnOne';
    var avgUrl = '/avgConversations';
    var contentShared = '/contentShared';
    var contentShareSizes = '/contentShareSizes';
    var mediaQuality = '/callQuality';
    var callMetrics = '/callMetrics';
    var mostActiveUrl = 'useractivity';
    var registeredEndpoints = 'trend/registeredEndpointsByDeviceType';
    var customerView = '&isCustomerView=true';
    var dateFormat = "MMM DD, YYYY";
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var timezone = "Etc/GMT";
    var cacheValue = (parseInt(moment.utc().format('H')) >= 8);

    var timeFilter = null;

    // Promise Tracking
    var ABORT = 'ABORT';
    var TIMEOUT = 'TIMEOUT';
    var activePromse = null;
    var mostActivePromise = null;
    var groupCancelPromise = null;
    var oneToOneCancelPromise = null;
    var avgCancelPromise = null;
    var contentSharedCancelPromise = null;
    var contentShareSizesCancelPromise = null;
    var metricsCancelPromise = null;
    var mediaCancelPromise = null;
    var deviceCancelPromise = null;

    return {
      getActiveUserData: getActiveUserData,
      getMostActiveUserData: getMostActiveUserData,
      getAvgRoomData: getAvgRoomData,
      getFilesSharedData: getFilesSharedData,
      getCallMetricsData: getCallMetricsData,
      getMediaQualityData: getMediaQualityData,
      getDeviceData: getDeviceData
    };

    function getActiveUserData(filter) {
      // cancel any currently running jobs
      if (activePromse !== null && angular.isDefined(activePromse)) {
        activePromse.resolve(ABORT);
      }
      activePromse = $q.defer();

      var returnData = {
        graphData: [],
        isActiveUsers: false
      };

      return getService(urlBase + detailed + activeUserUrl + getQuery(filter), activePromse).then(function (response) {
        if (angular.isDefined(response) && angular.isDefined(response.data) && angular.isDefined(response.data.data) && angular.isArray(response.data.data) && angular.isDefined(response.data.data[0].data)) {
          return adjustActiveUserData(response.data.data[0].data, filter, returnData);
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'Active user data not returned for customer.', $translate.instant('activeUsers.overallActiveUserGraphError'), returnData);
      });
    }

    function getMostActiveUserData(filter) {
      // cancel any currently running jobs
      if (mostActivePromise !== null && angular.isDefined(mostActivePromise)) {
        mostActivePromise.resolve(ABORT);
      }
      mostActivePromise = $q.defer();

      var query = "?type=weeklyUsage&cache=";
      if (filter.value === 1) {
        query = "?type=monthlyUsage&cache=";
      } else if (filter.value === 2) {
        query = "?type=threeMonthUsage&cache=";
      }

      return getService(urlBase + mostActiveUrl + query + cacheValue, mostActivePromise).then(function (response) {
        var data = [];
        if (angular.isDefined(response) && angular.isDefined(response.data) && angular.isDefined(response.data.data) && angular.isArray(response.data.data)) {
          angular.forEach(response.data.data, function (item, index, array) {
            data.push({
              'numCalls': parseInt(item.details.sparkCalls) + parseInt(item.details.sparkUcCalls),
              'totalActivity': parseInt(item.details.totalActivity),
              'sparkMessages': parseInt(item.details.sparkMessages),
              'userId': item.details.userId,
              'userName': item.details.userName
            });
          });
        }
        return data;
      }, function (response) {
        return returnErrorCheck(response, 'Most active user data not returned for customer.', $translate.instant('activeUsers.mostActiveError'), []);
      });
    }

    function adjustActiveUserData(activeData, filter, returnData) {
      var emptyGraph = true;
      var graphItem = {
        totalRegisteredUsers: 0,
        activeUsers: 0,
        percentage: 0,
        colorOne: chartColors.brandSuccessLight,
        colorTwo: chartColors.brandSuccessDark,
        balloon: true
      };
      var dayOffset = parseInt(moment.tz(activeData[(activeData.length - 1)].date, timezone).format('e'));
      if (dayOffset >= 4) {
        dayOffset = 7 - dayOffset;
      } else {
        dayOffset = -dayOffset;
      }
      var returnGraph = getReturnGraph(filter, dayOffset, graphItem);

      angular.forEach(activeData, function (item, index, activeArray) {
        var date = moment.tz(item.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          date = moment.tz(item.date, timezone).format(monthFormat);
        }

        var activeUsers = parseInt(item.details.activeUsers);
        var totalRegisteredUsers = parseInt(item.details.totalRegisteredUsers);

        // temporary fix for when totalRegisteredUsers equals 0 due to errors recording the number
        if (totalRegisteredUsers <= 0) {
          var previousTotal = 0;
          var nextTotal = 0;
          if (index !== 0) {
            previousTotal = parseInt(activeArray[index - 1].details.totalRegisteredUsers);
          }
          if (index < (activeArray.length - 1)) {
            nextTotal = parseInt(activeArray[index + 1].details.totalRegisteredUsers);
          }

          if (previousTotal < activeUsers && nextTotal < activeUsers) {
            totalRegisteredUsers = activeUsers;
          } else if (previousTotal > nextTotal) {
            totalRegisteredUsers = previousTotal;
          } else {
            totalRegisteredUsers = nextTotal;
          }
        }

        if (activeUsers > 0) {
          returnData.isActiveUsers = true;
        }

        if (activeUsers > 0 || totalRegisteredUsers > 0) {
          for (var i = 0; i < returnGraph.length; i++) {
            if (returnGraph[i].modifiedDate === date) {
              returnGraph[i].totalRegisteredUsers = totalRegisteredUsers;
              returnGraph[i].activeUsers = activeUsers;
              returnGraph[i].percentage = Math.round((activeUsers / totalRegisteredUsers) * 100);
              emptyGraph = false;
              break;
            }
          }
        }
      });

      if (!emptyGraph) {
        returnData.graphData = returnGraph;
      }
      return returnData;
    }

    function getAvgRoomData(filter) {
      // cancel any currently running jobs
      if (groupCancelPromise !== null && angular.isDefined(groupCancelPromise)) {
        groupCancelPromise.resolve(ABORT);
      }
      if (oneToOneCancelPromise !== null && angular.isDefined(oneToOneCancelPromise)) {
        oneToOneCancelPromise.resolve(ABORT);
      }
      if (avgCancelPromise !== null && angular.isDefined(avgCancelPromise)) {
        avgCancelPromise.resolve(ABORT);
      }
      groupCancelPromise = $q.defer();
      oneToOneCancelPromise = $q.defer();
      avgCancelPromise = $q.defer();

      var promises = [];
      var query = getQuery(filter);

      var groupData = [];
      var groupPromise = getService(urlBase + timechart + groupUrl + query + customerView, groupCancelPromise).success(function (response, status) {
        groupData = response.data;
        return;
      }).error(function (response, status) {
        groupData = returnErrorCheck(status, 'Group rooms data not returned for customer.', $translate.instant('avgRooms.groupError'), []);
        return;
      });
      promises.push(groupPromise);

      var oneToOneData = [];
      var oneToOnePromise = getService(urlBase + timechart + oneToOneUrl + query + customerView, oneToOneCancelPromise).success(function (response, status) {
        oneToOneData = response.data;
        return;
      }).error(function (response, status) {
        oneToOneData = returnErrorCheck(status, 'One to One rooms data not returned for customer.', $translate.instant('avgRooms.oneToOneError'), []);
        return;
      });
      promises.push(oneToOnePromise);

      var avgData = [];
      var avgPromise = getService(urlBase + timechart + avgUrl + query + customerView, avgCancelPromise).success(function (response, status) {
        avgData = response.data;
        return;
      }).error(function (response, status) {
        avgData = returnErrorCheck(status, 'Average rooms data not returned for customer.', $translate.instant('avgRooms.avgError'), []);
        return;
      });
      promises.push(avgPromise);

      return $q.all(promises).then(function () {
        if (groupData !== ABORT && oneToOneData !== ABORT && avgData !== ABORT) {
          return combineAvgRooms(groupData, oneToOneData, avgData, filter);
        } else {
          return ABORT;
        }
      }, function () {
        if (groupData !== ABORT && oneToOneData !== ABORT && avgData !== ABORT) {
          return combineAvgRooms(groupData, oneToOneData, avgData, filter);
        } else {
          return ABORT;
        }
      });
    }

    function combineAvgRooms(groupData, oneToOneData, avgData, filter) {
      var emptyGraph = true;
      var graphItem = {
        balloon: true,
        groupRooms: 0,
        oneToOneRooms: 0,
        totalRooms: 0,
        avgRooms: 0
      };
      var dayOffset = 0;
      if (groupData.length > 0) {
        dayOffset = parseInt(moment.tz(groupData[groupData.length - 1].date, timezone).format('e'));
        if ((oneToOneData.length > 0) && (groupData[groupData.length - 1] < oneToOneData[oneToOneData.length - 1])) {
          dayOffset = parseInt(moment.tz(oneToOneData[oneToOneData.length - 1].date, timezone).format('e'));
        } else if ((avgData.length > 0) && (groupData[groupData.length - 1] < avgData[avgData.length - 1])) {
          dayOffset = parseInt(moment.tz(avgData[avgData.length - 1].date, timezone).format('e'));
        }
      } else if (oneToOneData.length > 0) {
        dayOffset = parseInt(moment.tz(oneToOneData[oneToOneData.length - 1].date, timezone).format('e'));
        if ((avgData.length > 0) && (groupData[groupData.length - 1] < avgData[avgData.length - 1])) {
          dayOffset = parseInt(moment.tz(avgData[avgData.length - 1].date, timezone).format('e'));
        }
      } else if (avgData.length > 0) {
        dayOffset = parseInt(moment.tz(avgData[avgData.length - 1].date, timezone).format('e'));
      }

      if (dayOffset >= 4) {
        dayOffset = 7 - dayOffset;
      } else {
        dayOffset = -dayOffset;
      }
      var returnGraph = getReturnGraph(filter, dayOffset, graphItem);

      angular.forEach(groupData, function (groupItem, groupIndex, groupArray) {
        var modDate = moment.tz(groupItem.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          modDate = moment.tz(groupItem.date, timezone).format(monthFormat);
        }

        for (var index = 0; index < returnGraph.length; index++) {
          var returnItem = returnGraph[index];

          if (returnItem.modifiedDate === modDate) {
            returnItem.groupRooms = parseInt(groupItem.count);
            returnItem.totalRooms += parseInt(groupItem.count);

            if (returnItem.groupRooms !== 0) {
              emptyGraph = false;
            }
            break;
          }
        }
      });

      angular.forEach(oneToOneData, function (oneToOneItem, oneToOneIndex, oneToOneArray) {
        var modDate = moment.tz(oneToOneItem.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          modDate = moment.tz(oneToOneItem.date, timezone).format(monthFormat);
        }

        for (var index = 0; index < returnGraph.length; index++) {
          var returnItem = returnGraph[index];

          if (returnItem.modifiedDate === modDate) {
            returnItem.oneToOneRooms = parseInt(oneToOneItem.count);
            returnItem.totalRooms += parseInt(oneToOneItem.count);
            if (returnItem.oneToOneRooms !== 0) {
              emptyGraph = false;
            }
            break;
          }
        }
      });

      if (!emptyGraph) {
        angular.forEach(avgData, function (avgItem, avgIndex, avgArray) {
          var modDate = moment.tz(avgItem.date, timezone).format(dayFormat);
          if (filter.value === 2) {
            modDate = moment.tz(avgItem.date, timezone).format(monthFormat);
          }

          for (var index = 0; index < returnGraph.length; index++) {
            var returnItem = returnGraph[index];

            if (returnItem.modifiedDate === modDate) {
              returnItem.avgRooms = parseFloat(avgItem.count).toFixed(2);
              break;
            }
          }
        });

        return returnGraph;
      } else {
        return [];
      }
    }

    function getFilesSharedData(filter) {
      // cancel any currently running jobs
      if (contentSharedCancelPromise !== null && angular.isDefined(contentSharedCancelPromise)) {
        contentSharedCancelPromise.resolve(ABORT);
      }
      if (contentShareSizesCancelPromise !== null && angular.isDefined(contentShareSizesCancelPromise)) {
        contentShareSizesCancelPromise.resolve(ABORT);
      }
      contentSharedCancelPromise = $q.defer();
      contentShareSizesCancelPromise = $q.defer();

      var promises = [];
      var query = getQuery(filter);

      var contentSharedData = [];
      var contentSharedPromise = getService(urlBase + timechart + contentShared + query + customerView, contentSharedCancelPromise).success(function (response, status) {
        contentSharedData = response.data;
        return;
      }).error(function (response, status) {
        contentSharedData = returnErrorCheck(status, 'Shared content data not returned for customer.', $translate.instant('filesShared.contentSharedError'), []);
        return;
      });
      promises.push(contentSharedPromise);

      var contentShareSizesData = [];
      var contentShareSizesPromise = getService(urlBase + timechart + contentShareSizes + query + customerView, contentShareSizesCancelPromise).success(function (response, status) {
        contentShareSizesData = response.data;
        return;
      }).error(function (response, status) {
        contentShareSizesData = returnErrorCheck(status, 'Shared content data sizes not returned for customer.', $translate.instant('filesShared.contentShareSizesDataError'), []);
        return;
      });
      promises.push(contentShareSizesPromise);

      return $q.all(promises).then(function () {
        if (contentSharedData !== ABORT && contentShareSizesData !== ABORT) {
          return combineFilesShared(contentSharedData, contentShareSizesData, filter);
        } else {
          return ABORT;
        }
      }, function () {
        if (contentSharedData !== ABORT && contentShareSizesData !== ABORT) {
          return combineFilesShared(contentSharedData, contentShareSizesData, filter);
        } else {
          return ABORT;
        }
      });
    }

    function combineFilesShared(contentSharedData, contentShareSizesData, filter) {
      var emptyGraph = true;
      var graphItem = {
        balloon: true,
        contentShared: 0,
        contentShareSizes: 0,
        color: chartColors.brandSuccess
      };

      var dayOffset = 0;
      if (contentSharedData.length > 0) {
        dayOffset = parseInt(moment.tz(contentSharedData[contentSharedData.length - 1].date, timezone).format('e'));
        if ((contentShareSizesData.length > 0) && (contentSharedData[contentSharedData.length - 1] < contentShareSizesData[contentShareSizesData.length - 1])) {
          dayOffset = parseInt(moment.tz(contentShareSizesData[contentShareSizesData.length - 1].date, timezone).format('e'));
        }
      } else if (contentShareSizesData.length > 0) {
        dayOffset = parseInt(moment.tz(contentShareSizesData[contentShareSizesData.length - 1].date, timezone).format('e'));
      }

      if (dayOffset >= 4) {
        dayOffset = 7 - dayOffset;
      } else {
        dayOffset = -dayOffset;
      }
      var returnGraph = getReturnGraph(filter, dayOffset, graphItem);

      angular.forEach(contentSharedData, function (contentItem, contentIndex, contentArray) {
        var modDate = moment.tz(contentItem.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          modDate = moment.tz(contentItem.date, timezone).format(monthFormat);
        }

        for (var index = 0; index < returnGraph.length; index++) {
          var returnItem = returnGraph[index];

          if (returnItem.modifiedDate === modDate) {
            returnItem.contentShared = parseInt(contentItem.count);
            if (returnItem.contentShared !== 0) {
              emptyGraph = false;
            }
            break;
          }
        }
      });

      if (!emptyGraph) {
        angular.forEach(contentShareSizesData, function (shareItem, shareIndex, shareArray) {
          var modDate = moment.tz(shareItem.date, timezone).format(dayFormat);
          if (filter.value === 2) {
            modDate = moment.tz(shareItem.date, timezone).format(monthFormat);
          }

          for (var index = 0; index < returnGraph.length; index++) {
            var returnItem = returnGraph[index];

            if (returnItem.modifiedDate === modDate) {
              returnItem.contentShareSizes = parseFloat(shareItem.count).toFixed(2);
              break;
            }
          }
        });

        return returnGraph;
      } else {
        return [];
      }
    }

    function getCallMetricsData(filter) {
      // cancel any currently running jobs
      if (metricsCancelPromise !== null && angular.isDefined(metricsCancelPromise)) {
        metricsCancelPromise.resolve(ABORT);
      }
      metricsCancelPromise = $q.defer();
      var returnArray = {
        dataProvider: [],
        displayData: {}
      };

      return getService(urlBase + detailed + callMetrics + getAltQuery(filter), metricsCancelPromise).then(function (response, status) {
        if (response !== null && angular.isDefined(response) && angular.isArray(response.data.data) && angular.isArray(response.data.data[0].data)) {
          var details = response.data.data[0].data[0].details;
          var totalCalls = parseInt(details.totalCalls);
          if (totalCalls > 0) {
            returnArray.dataProvider = [{
              "callCondition": $translate.instant('callMetrics.audioCalls'),
              "numCalls": parseInt(details.sparkUcAudioCalls),
              "percentage": Math.round((parseInt(details.sparkUcAudioCalls) / parseInt(details.totalSuccessfulCalls)) * 100),
              "color": chartColors.colorAttentionBase
            }, {
              "callCondition": $translate.instant('callMetrics.videoCalls'),
              "numCalls": parseInt(details.sparkUcVideoCalls) + parseInt(details.sparkVideoCalls),
              "percentage": Math.round(((parseInt(details.sparkUcVideoCalls) + parseInt(details.sparkVideoCalls)) / parseInt(details.totalSuccessfulCalls)) * 100),
              "color": chartColors.primaryColorBase
            }];

            returnArray.displayData.totalCalls = totalCalls;
            returnArray.displayData.totalAudioDuration = parseInt(details.totalAudioDuration);
            returnArray.displayData.totalFailedCalls = parseFloat((parseFloat(details.totalFailedCalls) / totalCalls) * 100).toFixed(2);
          }
        }
        return returnArray;
      }, function (response, status) {
        return returnErrorCheck(response, 'Call metrics data not returned for customer.', $translate.instant('callMetrics.customerError'), returnArray);
      });
    }

    function getMediaQualityData(filter) {
      // cancel any currently running jobs
      if (mediaCancelPromise !== null && angular.isDefined(mediaCancelPromise)) {
        metricsCancelPromise.resolve(ABORT);
      }
      mediaCancelPromise = $q.defer();

      return getService(urlBase + detailed + mediaQuality + getQuery(filter), mediaCancelPromise).then(function (response, status) {
        var emptyGraph = true;
        if (response !== null && angular.isDefined(response)) {
          var data = response.data.data[0].data;
          var graphItem = {
            totalDurationSum: 0,
            goodQualityDurationSum: 0,
            fairQualityDurationSum: 0,
            poorQualityDurationSum: 0,
            partialSum: 0,
            totalAudioDurationSum: 0,
            goodAudioQualityDurationSum: 0,
            fairAudioQualityDurationSum: 0,
            poorAudioQualityDurationSum: 0,
            partialAudioSum: 0,
            totalVideoDurationSum: 0,
            goodVideoQualityDurationSum: 0,
            fairVideoQualityDurationSum: 0,
            poorVideoQualityDurationSum: 0,
            partialVideoSum: 0,
            balloon: true
          };
          var dayOffset = parseInt(moment.tz(data[(data.length - 1)].date, timezone).format('e'));
          if (dayOffset >= 4) {
            dayOffset = 7 - dayOffset;
          } else {
            dayOffset = -dayOffset;
          }
          var graph = getReturnGraph(filter, dayOffset, graphItem);

          angular.forEach(data, function (item, index, array) {
            var totalSum = parseInt(item.details.totalDurationSum);
            var goodSum = parseInt(item.details.goodQualityDurationSum);
            var fairSum = parseInt(item.details.fairQualityDurationSum);
            var poorSum = parseInt(item.details.poorQualityDurationSum);
            var partialSum = fairSum + poorSum;

            var goodVideoQualityDurationSum = parseInt(item.details.sparkGoodVideoDurationSum) + parseInt(item.details.sparkUcGoodVideoDurationSum);
            var fairVideoQualityDurationSum = parseInt(item.details.sparkFairVideoDurationSum) + parseInt(item.details.sparkUcFairVideoDurationSum);
            var poorVideoQualityDurationSum = parseInt(item.details.sparkPoorVideoDurationSum) + parseInt(item.details.sparkUcPoorVideoDurationSum);
            var totalVideoDurationSum = goodVideoQualityDurationSum + fairVideoQualityDurationSum + poorVideoQualityDurationSum;
            var partialVideoSum = fairVideoQualityDurationSum + poorVideoQualityDurationSum;

            var goodAudioQualityDurationSum = goodSum - goodVideoQualityDurationSum;
            var fairAudioQualityDurationSum = fairSum - fairVideoQualityDurationSum;
            var poorAudioQualityDurationSum = poorSum - poorVideoQualityDurationSum;
            var totalAudioDurationSum = goodAudioQualityDurationSum + fairAudioQualityDurationSum + poorAudioQualityDurationSum;
            var partialAudioSum = fairAudioQualityDurationSum + poorAudioQualityDurationSum;

            if (totalSum > 0 || goodSum > 0 || fairSum > 0 || poorSum > 0) {
              var modifiedDate = moment.tz(item.date, timezone).format(monthFormat);
              if (filter.value === 0 || filter.value === 1) {
                modifiedDate = moment.tz(item.date, timezone).format(dayFormat);
              }

              for (var i = 0; i < graph.length; i++) {
                if (graph[i].modifiedDate === modifiedDate) {
                  graph[i].totalDurationSum = totalSum;
                  graph[i].goodQualityDurationSum = goodSum;
                  graph[i].fairQualityDurationSum = fairSum;
                  graph[i].poorQualityDurationSum = poorSum;
                  graph[i].partialSum = partialSum;

                  graph[i].totalAudioDurationSum = totalAudioDurationSum;
                  graph[i].goodAudioQualityDurationSum = goodAudioQualityDurationSum;
                  graph[i].fairAudioQualityDurationSum = fairAudioQualityDurationSum;
                  graph[i].poorAudioQualityDurationSum = poorAudioQualityDurationSum;
                  graph[i].partialAudioSum = partialAudioSum;

                  graph[i].totalVideoDurationSum = totalVideoDurationSum;
                  graph[i].goodVideoQualityDurationSum = goodVideoQualityDurationSum;
                  graph[i].fairVideoQualityDurationSum = fairVideoQualityDurationSum;
                  graph[i].poorVideoQualityDurationSum = poorVideoQualityDurationSum;
                  graph[i].partialVideoSum = partialVideoSum;

                  emptyGraph = false;
                  break;
                }
              }
            }
          });
          if (emptyGraph) {
            return [];
          }
        }
        return graph;
      }, function (response) {
        return returnErrorCheck(response, 'Call quality data not returned for customer.', $translate.instant('mediaQuality.customerError'), []);
      });
    }

    function getDeviceData(filter) {
      // cancel any currently running jobs
      if (deviceCancelPromise !== null && angular.isDefined(deviceCancelPromise)) {
        deviceCancelPromise.resolve(ABORT);
      }
      deviceCancelPromise = $q.defer();

      return getService(urlBase + registeredEndpoints + getQuery(filter, cacheValue), deviceCancelPromise).then(function (response) {
        return analyzeDeviceData(response, filter);
      }, function (response) {
        return returnErrorCheck(response, 'Registered Endpoints data not returned for customer.', $translate.instant('registeredEndpoints.customerError'), {
          graphData: [],
          filterArray: []
        });
      });
    }

    function analyzeDeviceData(response, filter) {
      var deviceArray = {
        graphData: [],
        filterArray: []
      };
      if (angular.isDefined(response) && angular.isDefined(response.data) && angular.isDefined(response.data.data) && angular.isArray(response.data.data) && angular.isDefined(response.data.data[0].data) && angular.isArray(response.data.data[0].data)) {
        var data = response.data.data[0].data;
        var graphItem = {
          totalRegisteredDevices: 0
        };
        var dayOffset = 0;
        var responseLength = 0;

        angular.forEach(data, function (item, index, array) {
          if (responseLength < item.details.length) {
            responseLength = item.details.length;
            dayOffset = parseInt(moment.tz(item.details[(item.details.length - 1)].recordTime, timezone).format('e'));
          }
        });
        if (dayOffset >= 4) {
          dayOffset = 7 - dayOffset;
        } else {
          dayOffset = -dayOffset;
        }

        var baseGraph = getReturnGraph(filter, dayOffset, graphItem);
        deviceArray.graphData.push({
          deviceType: $translate.instant('registeredEndpoints.allDevices'),
          graph: angular.copy(baseGraph),
          emptyGraph: true,
          balloon: true
        });
        var filterIndex = 0;
        deviceArray.filterArray.push({
          value: filterIndex,
          label: deviceArray.graphData[0].deviceType
        });
        filterIndex++;

        angular.forEach(data, function (item, index, array) {
          deviceArray.filterArray.push({
            value: filterIndex,
            label: item.deviceType
          });
          filterIndex++;
          var tempGraph = {
            deviceType: item.deviceType,
            graph: angular.copy(baseGraph),
            emptyGraph: true,
            balloon: true
          };

          angular.forEach(item.details, function (detail, detailIndex, detailArray) {
            if (detail.totalRegisteredDevices > 0) {
              tempGraph.emptyGraph = false;
              deviceArray.graphData[0].emptyGraph = false;
              var modifiedDate = moment.tz(detail.recordTime, timezone).format(monthFormat);
              if (filter.value === 0 || filter.value === 1) {
                modifiedDate = moment.tz(detail.recordTime, timezone).format(dayFormat);
              }

              for (var i = 0; i < baseGraph.length; i++) {
                if (baseGraph[i].modifiedDate === modifiedDate) {
                  tempGraph.graph[i].totalRegisteredDevices = parseInt(detail.totalRegisteredDevices);
                  deviceArray.graphData[0].graph[i].totalRegisteredDevices += parseInt(detail.totalRegisteredDevices);
                  break;
                }
              }
            }
          });
          deviceArray.graphData.push(tempGraph);
        });
      }

      return deviceArray;
    }

    function getQuery(filter, cacheOption) {
      if (angular.isUndefined(cacheOption) || cacheOption === null) {
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

    function getAltQuery(filter, cacheOption) {
      if (angular.isUndefined(cacheOption) || cacheOption === null) {
        cacheOption = cacheValue;
      }
      if (filter.value === 0) {
        return '?&intervalCount=7&intervalType=day&spanCount=7&spanType=day&cache=' + cacheOption;
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=31&spanType=day&cache=' + cacheOption;
      } else {
        return '?&intervalCount=93&intervalType=day&spanCount=93&spanType=day&cache=' + cacheOption;
      }
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

    function getService(url, canceler) {
      if (canceler === null || angular.isUndefined(canceler)) {
        return $http.get(url);
      } else {
        return $http.get(url, {
          timeout: canceler.promise
        });
      }
    }

    function returnErrorCheck(error, debugMessage, message, returnItem) {
      if (error.status === 401 || error.status === 403) {
        Log.debug('User not authorized to access reports.  Status: ' + error.status);
        Notification.notify([$translate.instant('reportsPage.unauthorizedError')], 'error');
        return returnItem;
      } else if ((error.status !== 0) || (error.config.timeout.$$state.status === 0)) {
        if (error.status !== 0) {
          Log.debug(debugMessage + '  Status: ' + error.status + ' Response: ' + error.message);
        } else {
          Log.debug(debugMessage + '  Status: ' + error.status);
        }
        if (angular.isDefined(error.data) && angular.isDefined(error.data.trackingId) && (error.data.trackingId !== null)) {
          Notification.notify([message + '<br>' + $translate.instant('reportsPage.trackingId') + error.data.trackingId], 'error');
        } else {
          Notification.notify([message], 'error');
        }
        return returnItem;
      } else {
        return ABORT;
      }
    }
  }
})();
