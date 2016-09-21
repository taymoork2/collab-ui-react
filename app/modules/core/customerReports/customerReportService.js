(function () {
  'use strict';

  angular.module('Core')
    .service('CustomerReportService', CustomerReportService);

  /* @ngInject */
  function CustomerReportService($http, $translate, $q, Authinfo, Notification, chartColors, UrlConfig) {
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    var detailed = 'detailed';
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
    var registeredEndpoints = 'deviceType';
    var customerView = '&isCustomerView=true';
    var dayFormat = 'MMM DD';
    var monthFormat = 'MMMM';
    var timezone = 'Etc/GMT';
    var cacheValue = (parseInt(moment.utc().format('H'), 10) >= 8);
    var options = ['weeklyUsage', 'monthlyUsage', 'threeMonthUsage'];

    // Promise Tracking
    var ABORT = 'ABORT';
    var activePromise = null;
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

    function getPercentage(numberOne, numberTwo) {
      return Math.round((numberOne / numberTwo) * 100);
    }

    function getActiveUserData(filter) {
      // cancel any currently running jobs
      if (activePromise) {
        activePromise.resolve(ABORT);
      }
      activePromise = $q.defer();

      var returnData = {
        graphData: [],
        isActiveUsers: false
      };

      return getService(urlBase + detailed + activeUserUrl + getQuery(filter), activePromise).then(function (response) {
        var data = _.get(response, 'data.data[0].data');
        if (data) {
          return adjustActiveUserData(data, filter, returnData);
        } else {
          return returnData;
        }
      }, function (response) {
        return returnErrorCheck(response, 'activeUsers.overallActiveUserGraphError', returnData);
      });
    }

    function getMostActiveUserData(filter) {
      // cancel any currently running jobs
      if (mostActivePromise) {
        mostActivePromise.resolve(ABORT);
      }
      mostActivePromise = $q.defer();

      return getService(urlBase + mostActiveUrl + getReportTypeQuery(options[filter.value]), mostActivePromise).then(function (response) {
        var data = [];
        var responseData = _.get(response, 'data.data');
        if (responseData) {
          _.forEach(responseData, function (item) {
            data.push({
              numCalls: parseInt(item.details.sparkCalls, 10) + parseInt(item.details.sparkUcCalls, 10),
              totalActivity: parseInt(item.details.totalActivity, 10),
              sparkMessages: parseInt(item.details.sparkMessages, 10),
              userId: item.details.userId,
              userName: item.details.userName
            });
          });
        }
        return data;
      }, function (response) {
        return returnErrorCheck(response, 'activeUsers.mostActiveError', []);
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
      var dayOffset = parseInt(moment.tz(activeData[(activeData.length - 1)].date, timezone).format('e'), 10);
      if (dayOffset >= 4) {
        dayOffset = 7 - dayOffset;
      } else {
        dayOffset = -dayOffset;
      }
      var returnGraph = getReturnGraph(filter, dayOffset, graphItem);
      _.forEach(activeData, function (item, index, activeArray) {
        var date = moment.tz(item.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          date = moment.tz(item.date, timezone).format(monthFormat);
        }

        var activeUsers = parseInt(item.details.activeUsers, 10);
        var totalRegisteredUsers = parseInt(item.details.totalRegisteredUsers, 10);

        // temporary fix for when totalRegisteredUsers equals 0 due to errors recording the number
        if (totalRegisteredUsers <= 0) {
          var previousTotal = 0;
          var nextTotal = 0;
          if (index !== 0) {
            previousTotal = parseInt(activeArray[index - 1].details.totalRegisteredUsers, 10);
          }
          if (index < (activeArray.length - 1)) {
            nextTotal = parseInt(activeArray[index + 1].details.totalRegisteredUsers, 10);
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
          _.forEach(returnGraph, function (graphPoint) {
            if (graphPoint.date === date) {
              graphPoint.totalRegisteredUsers = totalRegisteredUsers;
              graphPoint.activeUsers = activeUsers;
              graphPoint.percentage = getPercentage(activeUsers, totalRegisteredUsers);
              emptyGraph = false;
            }
          });
        }
      });

      if (!emptyGraph) {
        returnData.graphData = returnGraph;
      }
      return returnData;
    }

    function getAvgRoomData(filter) {
      // cancel any currently running jobs
      if (groupCancelPromise) {
        groupCancelPromise.resolve(ABORT);
      }
      if (oneToOneCancelPromise) {
        oneToOneCancelPromise.resolve(ABORT);
      }
      if (avgCancelPromise) {
        avgCancelPromise.resolve(ABORT);
      }
      groupCancelPromise = $q.defer();
      oneToOneCancelPromise = $q.defer();
      avgCancelPromise = $q.defer();

      var promises = [];
      var query = getQuery(filter);

      var groupData = [];
      var groupPromise = getService(urlBase + timechart + groupUrl + query + customerView, groupCancelPromise).success(function (response) {
        groupData = response.data;
        return;
      }).error(function (response, status) {
        groupData = returnErrorCheck(status, 'avgRooms.groupError', []);
        return;
      });
      promises.push(groupPromise);

      var oneToOneData = [];
      var oneToOnePromise = getService(urlBase + timechart + oneToOneUrl + query + customerView, oneToOneCancelPromise).success(function (response) {
        oneToOneData = response.data;
        return;
      }).error(function (response, status) {
        oneToOneData = returnErrorCheck(status, 'avgRooms.oneToOneError', []);
        return;
      });
      promises.push(oneToOnePromise);

      var avgData = [];
      var avgPromise = getService(urlBase + timechart + avgUrl + query + customerView, avgCancelPromise).success(function (response) {
        avgData = response.data;
        return;
      }).error(function (response, status) {
        avgData = returnErrorCheck(status, 'avgRooms.avgError', []);
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
        dayOffset = parseInt(moment.tz(groupData[groupData.length - 1].date, timezone).format('e'), 10);
        if ((oneToOneData.length > 0) && (groupData[groupData.length - 1] < oneToOneData[oneToOneData.length - 1])) {
          dayOffset = parseInt(moment.tz(oneToOneData[oneToOneData.length - 1].date, timezone).format('e'), 10);
        } else if ((avgData.length > 0) && (groupData[groupData.length - 1] < avgData[avgData.length - 1])) {
          dayOffset = parseInt(moment.tz(avgData[avgData.length - 1].date, timezone).format('e'), 10);
        }
      } else if (oneToOneData.length > 0) {
        dayOffset = parseInt(moment.tz(oneToOneData[oneToOneData.length - 1].date, timezone).format('e'), 10);
        if ((avgData.length > 0) && (groupData[groupData.length - 1] < avgData[avgData.length - 1])) {
          dayOffset = parseInt(moment.tz(avgData[avgData.length - 1].date, timezone).format('e'), 10);
        }
      } else if (avgData.length > 0) {
        dayOffset = parseInt(moment.tz(avgData[avgData.length - 1].date, timezone).format('e'), 10);
      }

      if (dayOffset >= 4) {
        dayOffset = 7 - dayOffset;
      } else {
        dayOffset = -dayOffset;
      }
      var returnGraph = getReturnGraph(filter, dayOffset, graphItem);

      _.forEach(groupData, function (groupItem) {
        var modDate = moment.tz(groupItem.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          modDate = moment.tz(groupItem.date, timezone).format(monthFormat);
        }

        _.forEach(returnGraph, function (returnItem) {
          if (returnItem.date === modDate) {
            returnItem.groupRooms = parseInt(groupItem.count, 10);
            returnItem.totalRooms += parseInt(groupItem.count, 10);

            if (returnItem.groupRooms !== 0) {
              emptyGraph = false;
            }
          }
        });
      });

      _.forEach(oneToOneData, function (oneToOneItem) {
        var modDate = moment.tz(oneToOneItem.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          modDate = moment.tz(oneToOneItem.date, timezone).format(monthFormat);
        }

        _.forEach(returnGraph, function (returnItem) {
          if (returnItem.date === modDate) {
            returnItem.oneToOneRooms = parseInt(oneToOneItem.count, 10);
            returnItem.totalRooms += parseInt(oneToOneItem.count, 10);
            if (returnItem.oneToOneRooms !== 0) {
              emptyGraph = false;
            }
          }
        });
      });

      if (!emptyGraph) {
        _.forEach(avgData, function (avgItem) {
          var modDate = moment.tz(avgItem.date, timezone).format(dayFormat);
          if (filter.value === 2) {
            modDate = moment.tz(avgItem.date, timezone).format(monthFormat);
          }

          _.forEach(returnGraph, function (returnItem) {
            if (returnItem.date === modDate) {
              returnItem.avgRooms = parseFloat(avgItem.count).toFixed(2);
            }
          });
        });

        return returnGraph;
      } else {
        return [];
      }
    }

    function getFilesSharedData(filter) {
      // cancel any currently running jobs
      if (contentSharedCancelPromise) {
        contentSharedCancelPromise.resolve(ABORT);
      }
      if (contentShareSizesCancelPromise) {
        contentShareSizesCancelPromise.resolve(ABORT);
      }
      contentSharedCancelPromise = $q.defer();
      contentShareSizesCancelPromise = $q.defer();

      var promises = [];
      var query = getQuery(filter);

      var contentSharedData = [];
      var contentSharedPromise = getService(urlBase + timechart + contentShared + query + customerView, contentSharedCancelPromise).success(function (response) {
        contentSharedData = response.data;
        return;
      }).error(function (response, status) {
        contentSharedData = returnErrorCheck(status, $translate.instant('filesShared.contentSharedError'), []);
        return;
      });
      promises.push(contentSharedPromise);

      var contentShareSizesData = [];
      var contentShareSizesPromise = getService(urlBase + timechart + contentShareSizes + query + customerView, contentShareSizesCancelPromise).success(function (response) {
        contentShareSizesData = response.data;
        return;
      }).error(function (response, status) {
        contentShareSizesData = returnErrorCheck(status, 'filesShared.contentShareSizesDataError', []);
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
        dayOffset = parseInt(moment.tz(contentSharedData[contentSharedData.length - 1].date, timezone).format('e'), 10);
        if ((contentShareSizesData.length > 0) && (contentSharedData[contentSharedData.length - 1] < contentShareSizesData[contentShareSizesData.length - 1])) {
          dayOffset = parseInt(moment.tz(contentShareSizesData[contentShareSizesData.length - 1].date, timezone).format('e'), 10);
        }
      } else if (contentShareSizesData.length > 0) {
        dayOffset = parseInt(moment.tz(contentShareSizesData[contentShareSizesData.length - 1].date, timezone).format('e'), 10);
      }

      if (dayOffset >= 4) {
        dayOffset = 7 - dayOffset;
      } else {
        dayOffset = -dayOffset;
      }
      var returnGraph = getReturnGraph(filter, dayOffset, graphItem);

      _.forEach(contentSharedData, function (contentItem) {
        var modDate = moment.tz(contentItem.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          modDate = moment.tz(contentItem.date, timezone).format(monthFormat);
        }

        _.forEach(returnGraph, function (returnItem) {
          if (returnItem.date === modDate) {
            returnItem.contentShared = parseInt(contentItem.count, 10);
            if (returnItem.contentShared !== 0) {
              emptyGraph = false;
            }
          }
        });
      });

      if (!emptyGraph) {
        _.forEach(contentShareSizesData, function (shareItem) {
          var modDate = moment.tz(shareItem.date, timezone).format(dayFormat);
          if (filter.value === 2) {
            modDate = moment.tz(shareItem.date, timezone).format(monthFormat);
          }

          _.forEach(returnGraph, function (returnItem) {
            if (returnItem.date === modDate) {
              returnItem.contentShareSizes = parseFloat(shareItem.count).toFixed(2);
            }
          });
        });

        return returnGraph;
      } else {
        return [];
      }
    }

    function getCallMetricsData(filter) {
      // cancel any currently running jobs
      if (metricsCancelPromise) {
        metricsCancelPromise.resolve(ABORT);
      }
      metricsCancelPromise = $q.defer();
      var returnArray = {
        dataProvider: [],
        displayData: {}
      };

      return getService(urlBase + detailed + callMetrics + getAltQuery(filter), metricsCancelPromise).then(function (response) {
        var details = _.get(response, 'data.data[0].data[0].details');
        if (details) {
          var totalCalls = parseInt(details.totalCalls, 10);
          if (totalCalls > 0) {
            var audioCalls = parseInt(details.sparkUcAudioCalls, 10);
            var successfulCalls = parseInt(details.totalSuccessfulCalls, 10);
            var videoCalls = parseInt(details.sparkUcVideoCalls, 10) + parseInt(details.sparkVideoCalls, 10);

            returnArray.dataProvider = [{
              callCondition: $translate.instant('callMetrics.audioCalls'),
              numCalls: audioCalls,
              percentage: getPercentage(audioCalls, successfulCalls),
              color: chartColors.colorAttentionBase
            }, {
              callCondition: $translate.instant('callMetrics.videoCalls'),
              numCalls: videoCalls,
              percentage: getPercentage(videoCalls, successfulCalls),
              color: chartColors.primaryColorBase
            }];

            returnArray.displayData.totalCalls = totalCalls;
            returnArray.displayData.totalAudioDuration = parseInt(details.totalAudioDuration, 10);
            returnArray.displayData.totalFailedCalls = parseFloat((parseFloat(details.totalFailedCalls) / totalCalls) * 100).toFixed(2);
          }
        }
        return returnArray;
      }, function (response) {
        return returnErrorCheck(response, 'callMetrics.customerError', returnArray);
      });
    }

    function getMediaQualityData(filter) {
      // cancel any currently running jobs
      if (mediaCancelPromise) {
        metricsCancelPromise.resolve(ABORT);
      }
      mediaCancelPromise = $q.defer();

      return getService(urlBase + detailed + mediaQuality + getQuery(filter), mediaCancelPromise).then(function (response) {
        var emptyGraph = true;
        var data = _.get(response, 'data.data[0].data');
        if (data) {
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
          var dayOffset = parseInt(moment.tz(data[(data.length - 1)].date, timezone).format('e'), 10);
          if (dayOffset >= 4) {
            dayOffset = 7 - dayOffset;
          } else {
            dayOffset = -dayOffset;
          }
          var graph = getReturnGraph(filter, dayOffset, graphItem);

          _.forEach(data, function (item) {
            var totalSum = parseInt(item.details.totalDurationSum, 10);
            var goodSum = parseInt(item.details.goodQualityDurationSum, 10);
            var fairSum = parseInt(item.details.fairQualityDurationSum, 10);
            var poorSum = parseInt(item.details.poorQualityDurationSum, 10);
            var partialSum = fairSum + poorSum;

            var goodVideoQualityDurationSum = parseInt(item.details.sparkGoodVideoDurationSum, 10) + parseInt(item.details.sparkUcGoodVideoDurationSum, 10);
            var fairVideoQualityDurationSum = parseInt(item.details.sparkFairVideoDurationSum, 10) + parseInt(item.details.sparkUcFairVideoDurationSum, 10);
            var poorVideoQualityDurationSum = parseInt(item.details.sparkPoorVideoDurationSum, 10) + parseInt(item.details.sparkUcPoorVideoDurationSum, 10);
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

              _.forEach(graph, function (graphPoint) {
                if (graphPoint.date === modifiedDate) {
                  graphPoint.totalDurationSum = totalSum;
                  graphPoint.goodQualityDurationSum = goodSum;
                  graphPoint.fairQualityDurationSum = fairSum;
                  graphPoint.poorQualityDurationSum = poorSum;
                  graphPoint.partialSum = partialSum;

                  graphPoint.totalAudioDurationSum = totalAudioDurationSum;
                  graphPoint.goodAudioQualityDurationSum = goodAudioQualityDurationSum;
                  graphPoint.fairAudioQualityDurationSum = fairAudioQualityDurationSum;
                  graphPoint.poorAudioQualityDurationSum = poorAudioQualityDurationSum;
                  graphPoint.partialAudioSum = partialAudioSum;

                  graphPoint.totalVideoDurationSum = totalVideoDurationSum;
                  graphPoint.goodVideoQualityDurationSum = goodVideoQualityDurationSum;
                  graphPoint.fairVideoQualityDurationSum = fairVideoQualityDurationSum;
                  graphPoint.poorVideoQualityDurationSum = poorVideoQualityDurationSum;
                  graphPoint.partialVideoSum = partialVideoSum;

                  emptyGraph = false;
                }
              });
            }
          });
          if (emptyGraph) {
            return [];
          }
        }
        return graph;
      }, function (response) {
        return returnErrorCheck(response, 'mediaQuality.customerError', []);
      });
    }

    function getDeviceData(filter) {
      // cancel any currently running jobs
      if (deviceCancelPromise) {
        deviceCancelPromise.resolve(ABORT);
      }
      deviceCancelPromise = $q.defer();

      return getService(urlBase + registeredEndpoints + getReportTypeQuery(options[filter.value]), deviceCancelPromise).then(function (response) {
        return analyzeDeviceData(response, filter);
      }, function (response) {
        return returnErrorCheck(response, 'registeredEndpoints.customerError', {
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
      var data = _.get(response, 'data.data');
      if (data) {
        var graphItem = {
          totalRegisteredDevices: 0
        };
        var dayOffset = 0;
        var responseLength = 0;

        _.forEach(data, function (item) {
          if (item.details && responseLength < item.details.length) {
            responseLength = item.details.length;
            dayOffset = parseInt(moment.tz(item.details[(item.details.length - 1)].recordTime, timezone).format('e'), 10);
          }
        });
        if (dayOffset >= 4) {
          dayOffset = 7 - dayOffset;
        } else {
          dayOffset = -dayOffset;
        }

        deviceArray.graphData.push({
          deviceType: $translate.instant('registeredEndpoints.allDevices'),
          graph: getReturnGraph(filter, dayOffset, graphItem),
          emptyGraph: true,
          balloon: true
        });
        var filterIndex = 0;
        deviceArray.filterArray.push({
          value: filterIndex,
          label: deviceArray.graphData[0].deviceType
        });
        filterIndex++;

        _.forEach(data, function (item) {
          deviceArray.filterArray.push({
            value: filterIndex,
            label: item.deviceType
          });
          filterIndex++;
          var tempGraph = {
            deviceType: item.deviceType,
            graph: getReturnGraph(filter, dayOffset, graphItem),
            emptyGraph: true,
            balloon: true
          };

          _.forEach(item.details, function (detail) {
            var registeredDevices = parseInt(detail.totalRegisteredDevices, 10);
            if (registeredDevices > 0) {
              tempGraph.emptyGraph = false;
              deviceArray.graphData[0].emptyGraph = false;
              var modifiedDate = moment.tz(detail.recordTime, timezone).format(monthFormat);
              if (filter.value === 0 || filter.value === 1) {
                modifiedDate = moment.tz(detail.recordTime, timezone).format(dayFormat);
              }

              _.forEach(tempGraph.graph, function (graphPoint, index) {
                if (graphPoint.date === modifiedDate) {
                  graphPoint.totalRegisteredDevices = registeredDevices;
                  deviceArray.graphData[0].graph[index].totalRegisteredDevices += registeredDevices;
                }
              });
            }
          });
          deviceArray.graphData.push(tempGraph);
        });
      }

      return deviceArray;
    }

    function getReportTypeQuery(option, cacheOption) {
      if (_.isUndefined(cacheOption) || _.isNull(cacheOption)) {
        cacheOption = cacheValue;
      }
      return '?type=' + option + '&cache=' + cacheOption;
    }

    function getQuery(filter, cacheOption) {
      if (_.isUndefined(cacheOption) || _.isNull(cacheOption)) {
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
      if (_.isUndefined(cacheOption) || _.isNull(cacheOption)) {
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
          var tmpItem = _.clone(graphItem);
          tmpItem.date = moment().tz(timezone).subtract(i + 1, 'day').format(dayFormat);
          returnGraph.push(tmpItem);
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          var temp = _.clone(graphItem);
          temp.date = moment().tz(timezone)
            .startOf('week')
            .subtract(dayOffset + (x * 7), 'day')
            .format(dayFormat);
          returnGraph.push(temp);
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          var item = _.clone(graphItem);
          item.date = moment().tz(timezone)
            .subtract(y, 'month')
            .startOf('month')
            .format(monthFormat);
          returnGraph.push(item);
        }
      }

      return returnGraph;
    }

    function getService(url, canceler) {
      if (canceler) {
        return $http.get(url, {
          timeout: canceler.promise
        });
      } else {
        return $http.get(url);
      }
    }

    function returnErrorCheck(error, message, returnItem) {
      if (error.status === 401 || error.status === 403) {
        Notification.error('reportsPage.unauthorizedError');
        return returnItem;
      } else if ((error.status !== 0) || (error.config.timeout.$$state.status === 0)) {
        Notification.errorWithTrackingId(error, message);
        return returnItem;
      } else {
        return ABORT;
      }
    }
  }
})();
