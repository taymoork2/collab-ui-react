(function () {
  'use strict';

  angular.module('Core')
    .service('CustomerReportService', CustomerReportService);

  /* @ngInject */
  function CustomerReportService($translate, $q, chartColors, CommonReportService) {
    var detailed = 'detailed';
    var timechart = 'timeCharts';

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

    function getActiveUserData(filter, linegraph) {
      // cancel any currently running jobs
      if (activePromise) {
        activePromise.resolve(ABORT);
      }
      activePromise = $q.defer();

      var returnData = {
        graphData: [],
        isActiveUsers: false
      };

      if (linegraph) {
        var lineOptions = CommonReportService.getLineTypeOptions(filter, 'activeUsers');
        return CommonReportService.getCustomerAltReportByType(lineOptions, activePromise).then(function (response) {
          var data = _.get(response, 'data.data');
          if (data) {
            return adjustActiveLineData(data, filter, returnData);
          } else {
            return returnData;
          }
        }).catch(function (error) {
          return CommonReportService.returnErrorCheck(error, 'activeUsers.overallActiveUserGraphError', returnData);
        });

      } else {
        var options = CommonReportService.getCustomerOptions(filter, 'activeUsers', detailed, undefined);
        return CommonReportService.getCustomerReport(options, activePromise).then(function (response) {
          var data = _.get(response, 'data.data[0].data');
          if (data) {
            return adjustActiveUserData(data, filter, returnData);
          } else {
            return returnData;
          }
        }).catch(function (error) {
          return CommonReportService.returnErrorCheck(error, 'activeUsers.overallActiveUserGraphError', returnData);
        });
      }
    }

    function getMostActiveUserData(filter) {
      // cancel any currently running jobs
      if (mostActivePromise) {
        mostActivePromise.resolve(ABORT);
      }
      mostActivePromise = $q.defer();

      var options = CommonReportService.getTypeOptions(filter, 'useractivity');
      return CommonReportService.getCustomerReportByType(options, mostActivePromise).then(function (response) {
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
      }).catch(function (error) {
        return CommonReportService.returnErrorCheck(error, 'activeUsers.mostActiveError', []);
      });
    }

    function adjustActiveLineData(activeData, filter, returnData) {
      var emptyGraph = true;
      var graphItem = {
        totalRegisteredUsers: 0,
        activeUsers: 0,
        percentage: 0,
        balloon: true
      };
      var returnGraph = CommonReportService.getReturnLineGraph(filter, graphItem);

      _.forEach(activeData, function (item, index, activeArray) {
        var date = CommonReportService.getModifiedLineDate(item.date);
        var details = _.get(item, 'details[0]');
        if (details) {
          var activeUsers = parseInt(details.combinedActiveUsers, 10);
          var totalRegisteredUsers = parseInt(details.totalSparkEntitled, 10);

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
        }
      });

      if (!emptyGraph) {
        returnData.graphData = returnGraph;
      }
      return returnData;
    }

    function adjustActiveUserData(activeData, filter, returnData) {
      var emptyGraph = true;
      var graphItem = {
        totalRegisteredUsers: 0,
        activeUsers: 0,
        percentage: 0,
        balloon: true
      };
      var returnGraph = CommonReportService.getReturnGraph(filter, activeData[(activeData.length - 1)].date, graphItem);

      _.forEach(activeData, function (item, index, activeArray) {
        var date = CommonReportService.getModifiedDate(item.date, filter);
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

      var groupOptions = CommonReportService.getCustomerOptions(filter, 'conversations', timechart, true);
      var oneToOneOptions = CommonReportService.getCustomerOptions(filter, 'convOneOnOne', timechart, true);
      var avgOptions = CommonReportService.getCustomerOptions(filter, 'avgConversations', timechart, true);
      var promises = [];
      var groupData = [];
      var oneToOneData = [];
      var avgData = [];

      var groupPromise = CommonReportService.getCustomerReport(groupOptions, groupCancelPromise).then(function (response) {
        groupData = _.get(response, 'data.data', []);
        return;
      }).catch(function (error) {
        groupData = CommonReportService.returnErrorCheck(error, 'avgRooms.groupError', []);
        return;
      });
      promises.push(groupPromise);

      var oneToOnePromise = CommonReportService.getCustomerReport(oneToOneOptions, oneToOneCancelPromise).then(function (response) {
        oneToOneData = _.get(response, 'data.data', []);
        return;
      }).catch(function (error) {
        oneToOneData = CommonReportService.returnErrorCheck(error, 'avgRooms.oneToOneError', []);
        return;
      });
      promises.push(oneToOnePromise);

      var avgPromise = CommonReportService.getCustomerReport(avgOptions, avgCancelPromise).then(function (response) {
        avgData = _.get(response, 'data.data', []);
        return;
      }).catch(function (error) {
        avgData = CommonReportService.returnErrorCheck(error, 'avgRooms.avgError', []);
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
      var date;
      var groupDate = _.get(groupData, '[groupData.length - 1].date');
      var oneToOneDate = _.get(oneToOneData, '[oneToOneData.length - 1].date');
      var avgDate = _.get(avgData, '[avgData.length - 1].date');
      if (groupData.length > 0) {
        date = groupDate;
        if ((oneToOneData.length > 0) && (groupDate < oneToOneDate)) {
          date = oneToOneDate;
        } else if ((avgData.length > 0) && (groupDate < avgDate)) {
          date = avgDate;
        }
      } else if (oneToOneData.length > 0) {
        date = oneToOneDate;
        if ((avgData.length > 0) && (oneToOneDate < avgDate)) {
          date = avgDate;
        }
      } else if (avgData.length > 0) {
        date = avgDate;
      }

      var returnGraph = CommonReportService.getReturnGraph(filter, date, graphItem);
      _.forEach(groupData, function (groupItem) {
        var modDate = CommonReportService.getModifiedDate(groupItem.date, filter);

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
        var modDate = CommonReportService.getModifiedDate(oneToOneItem.date, filter);

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
          var modDate = CommonReportService.getModifiedDate(avgItem.date, filter);

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

      var contentSharedOptions = CommonReportService.getCustomerOptions(filter, 'contentShared', timechart, true);
      var contentShareSizesOptions = CommonReportService.getCustomerOptions(filter, 'contentShareSizes', timechart, true);
      var promises = [];
      var contentSharedData = [];
      var contentShareSizesData = [];

      var contentSharedPromise = CommonReportService.getCustomerReport(contentSharedOptions, contentSharedCancelPromise).then(function (response) {
        contentSharedData = _.get(response, 'data.data', []);
        return;
      }).catch(function (error) {
        contentSharedData = CommonReportService.returnErrorCheck(error, $translate.instant('filesShared.contentSharedError'), []);
        return;
      });
      promises.push(contentSharedPromise);

      var contentShareSizesPromise = CommonReportService.getCustomerReport(contentShareSizesOptions, contentShareSizesCancelPromise).then(function (response) {
        contentShareSizesData = _.get(response, 'data.data', []);
        return;
      }).catch(function (error) {
        contentShareSizesData = CommonReportService.returnErrorCheck(error, 'filesShared.contentShareSizesDataError', []);
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

      var date;
      var contentSharedDate = _.get(contentSharedData, '[contentSharedData.length - 1].date');
      var contentShareSizesDate = _.get(contentShareSizesData, '[contentShareSizesData.length - 1].date');
      if (contentSharedData.length > 0) {
        date = contentSharedDate;
        if ((contentShareSizesData.length > 0) && (contentSharedDate < contentShareSizesDate)) {
          date = contentShareSizesDate;
        }
      } else if (contentShareSizesData.length > 0) {
        date = contentShareSizesDate;
      }
      var returnGraph = CommonReportService.getReturnGraph(filter, date, graphItem);

      _.forEach(contentSharedData, function (contentItem) {
        var modDate = CommonReportService.getModifiedDate(contentItem.date, filter);

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
          var modDate = CommonReportService.getModifiedDate(shareItem.date, filter);

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
      var options = CommonReportService.getAltCustomerOptions(filter, 'callMetrics', detailed, undefined);

      return CommonReportService.getCustomerReport(options, metricsCancelPromise).then(function (response) {
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
      }).catch(function (error) {
        return CommonReportService.returnErrorCheck(error, 'callMetrics.customerError', returnArray);
      });
    }

    function getMediaQualityData(filter) {
      // cancel any currently running jobs
      if (mediaCancelPromise) {
        metricsCancelPromise.resolve(ABORT);
      }
      mediaCancelPromise = $q.defer();

      var options = CommonReportService.getCustomerOptions(filter, 'callQuality', detailed, undefined);
      return CommonReportService.getCustomerReport(options, mediaCancelPromise).then(function (response) {
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
          var graph = CommonReportService.getReturnGraph(filter, _.get(data, '[data.length - 1].date'), graphItem);

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
              var modifiedDate = CommonReportService.getModifiedDate(item.date, filter);

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
      }).catch(function (error) {
        return CommonReportService.returnErrorCheck(error, 'mediaQuality.customerError', []);
      });
    }

    function getDeviceData(filter) {
      // cancel any currently running jobs
      if (deviceCancelPromise) {
        deviceCancelPromise.resolve(ABORT);
      }
      deviceCancelPromise = $q.defer();

      var options = CommonReportService.getTypeOptions(filter, 'deviceType');
      return CommonReportService.getCustomerReportByType(options, deviceCancelPromise).then(function (response) {
        return analyzeDeviceData(response, filter);
      }).catch(function (error) {
        return CommonReportService.returnErrorCheck(error, 'registeredEndpoints.customerError', {
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
        var date;
        var responseLength = 0;

        _.forEach(data, function (item) {
          var details = _.get(item.details);
          if (details && responseLength < details.length) {
            responseLength = details.length;
            date = _.get(details, '[details.length - 1].recordTime');
          }
        });

        deviceArray.graphData.push({
          deviceType: $translate.instant('registeredEndpoints.allDevices'),
          graph: CommonReportService.getReturnGraph(filter, date, graphItem),
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
            graph: CommonReportService.getReturnGraph(filter, date, graphItem),
            emptyGraph: true,
            balloon: true
          };

          _.forEach(item.details, function (detail) {
            var registeredDevices = parseInt(detail.totalRegisteredDevices, 10);
            if (registeredDevices > 0) {
              tempGraph.emptyGraph = false;
              deviceArray.graphData[0].emptyGraph = false;
              var modifiedDate = CommonReportService.getModifiedDate(detail.recordTime, filter);

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
  }
})();
