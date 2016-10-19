(function () {
  'use strict';

  angular.module('Core')
    .service('CustomerReportService', CustomerReportService);

  /* @ngInject */
  function CustomerReportService($translate, $q, chartColors, CommonReportService, ReportConstants) {
    // Promise Tracking
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
      return Math.round((numberOne / numberTwo) * ReportConstants.PERCENTAGE_MULTIPLIER);
    }

    function getActiveUserData(filter, linegraph) {
      // cancel any currently running jobs
      if (activePromise) {
        activePromise.resolve(ReportConstants.ABORT);
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
        var options = CommonReportService.getCustomerOptions(filter, 'activeUsers', CommonReportService.DETAILED, undefined);
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
        mostActivePromise.resolve(ReportConstants.ABORT);
      }
      mostActivePromise = $q.defer();
      var returnObject = {
        tableData: [],
        error: false
      };

      var lineOptions = CommonReportService.getTypeOptions(filter, 'mostActive');
      return CommonReportService.getCustomerAltReportByType(lineOptions, mostActivePromise).then(function (response) {
        var responseData = _.get(response, 'data.data');
        if (responseData) {
          _.forEach(responseData, function (item) {
            var details = _.get(item, 'details');
            if (details) {
              returnObject.tableData.push({
                numCalls: parseInt(details.sparkCalls, ReportConstants.INTEGER_BASE) + parseInt(item.details.sparkUcCalls, ReportConstants.INTEGER_BASE),
                totalActivity: parseInt(details.totalActivity, ReportConstants.INTEGER_BASE),
                sparkMessages: parseInt(details.sparkMessages, ReportConstants.INTEGER_BASE),
                userName: details.userName
              });
            }
          });
        }
        return returnObject;
      }).catch(function (error) {
        returnObject.error = true;
        return CommonReportService.returnErrorCheck(error, 'activeUsers.mostActiveError', returnObject);
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
          var activeUsers = parseInt(details.combinedActiveUsers, ReportConstants.INTEGER_BASE);
          var totalRegisteredUsers = parseInt(details.totalSparkEntitled, ReportConstants.INTEGER_BASE);

          // temporary fix for when totalRegisteredUsers equals 0 due to errors recording the number
          if (totalRegisteredUsers <= 0) {
            var previousTotal = 0;
            var nextTotal = 0;
            if (index !== 0) {
              previousTotal = parseInt(activeArray[index - 1].details.totalRegisteredUsers, ReportConstants.INTEGER_BASE);
            }
            if (index < (activeArray.length - 1)) {
              nextTotal = parseInt(activeArray[index + 1].details.totalRegisteredUsers, ReportConstants.INTEGER_BASE);
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
        returnData.graphData = trimEmptyDataSets(returnGraph);
      }
      return returnData;
    }

    function trimEmptyDataSets(graph) {
      if (graph.length <= ReportConstants.THIRTEEN_WEEKS) {
        return graph;
      } else {
        var returnGraph = [];
        var emptyGraph = true;
        _.forEach(graph, function (item, index) {
          if (index !== 0 && emptyGraph) {
            var totalUsers = _.get(item, 'totalRegisteredUsers');
            var nextTotalUsers = _.get(graph[index + 1], 'totalRegisteredUsers');
            if (totalUsers > 0 || nextTotalUsers > 0 || index >= (graph.length - ReportConstants.THIRTEEN_WEEKS)) {
              emptyGraph = false;
            }
          }

          if (!emptyGraph) {
            returnGraph.push(item);
          }
        });
        return returnGraph;
      }
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
        var activeUsers = parseInt(item.details.activeUsers, ReportConstants.INTEGER_BASE);
        var totalRegisteredUsers = parseInt(item.details.totalRegisteredUsers, ReportConstants.INTEGER_BASE);

        // temporary fix for when totalRegisteredUsers equals 0 due to errors recording the number
        if (totalRegisteredUsers <= 0) {
          var previousTotal = 0;
          var nextTotal = 0;
          if (index !== 0) {
            previousTotal = parseInt(activeArray[index - 1].details.totalRegisteredUsers, ReportConstants.INTEGER_BASE);
          }
          if (index < (activeArray.length - 1)) {
            nextTotal = parseInt(activeArray[index + 1].details.totalRegisteredUsers, ReportConstants.INTEGER_BASE);
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
        groupCancelPromise.resolve(ReportConstants.ABORT);
      }
      if (oneToOneCancelPromise) {
        oneToOneCancelPromise.resolve(ReportConstants.ABORT);
      }
      if (avgCancelPromise) {
        avgCancelPromise.resolve(ReportConstants.ABORT);
      }
      groupCancelPromise = $q.defer();
      oneToOneCancelPromise = $q.defer();
      avgCancelPromise = $q.defer();

      var groupOptions = CommonReportService.getCustomerOptions(filter, 'conversations', CommonReportService.TIME_CHARTS, true);
      var oneToOneOptions = CommonReportService.getCustomerOptions(filter, 'convOneOnOne', CommonReportService.TIME_CHARTS, true);
      var avgOptions = CommonReportService.getCustomerOptions(filter, 'avgConversations', CommonReportService.TIME_CHARTS, true);
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
        if (groupData !== ReportConstants.ABORT && oneToOneData !== ReportConstants.ABORT && avgData !== ReportConstants.ABORT) {
          return combineAvgRooms(groupData, oneToOneData, avgData, filter);
        } else {
          return ReportConstants.ABORT;
        }
      }, function () {
        if (groupData !== ReportConstants.ABORT && oneToOneData !== ReportConstants.ABORT && avgData !== ReportConstants.ABORT) {
          return combineAvgRooms(groupData, oneToOneData, avgData, filter);
        } else {
          return ReportConstants.ABORT;
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
      var date = '';
      if (groupData[0] && oneToOneData[0] && avgData[0]) {
        var groupDate = groupData[0].date;
        var oneToOneDate = oneToOneData[0].date;
        var avgDate = avgData[0].date;
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
      }

      var returnGraph = CommonReportService.getReturnGraph(filter, date, graphItem);
      _.forEach(groupData, function (groupItem) {
        var modDate = CommonReportService.getModifiedDate(groupItem.date, filter);

        _.forEach(returnGraph, function (returnItem) {
          if (returnItem.date === modDate) {
            returnItem.groupRooms = parseInt(groupItem.count, ReportConstants.INTEGER_BASE);
            returnItem.totalRooms += parseInt(groupItem.count, ReportConstants.INTEGER_BASE);
            if (returnItem.groupRooms > 0) {
              emptyGraph = false;
            }
          }
        });
      });

      _.forEach(oneToOneData, function (oneToOneItem) {
        var modDate = CommonReportService.getModifiedDate(oneToOneItem.date, filter);

        _.forEach(returnGraph, function (returnItem) {
          if (returnItem.date === modDate) {
            returnItem.oneToOneRooms = parseInt(oneToOneItem.count, ReportConstants.INTEGER_BASE);
            returnItem.totalRooms += parseInt(oneToOneItem.count, ReportConstants.INTEGER_BASE);
            if (returnItem.oneToOneRooms > 0) {
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
              returnItem.avgRooms = parseFloat(avgItem.count).toFixed(ReportConstants.FIXED);
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
        contentSharedCancelPromise.resolve(ReportConstants.ABORT);
      }
      if (contentShareSizesCancelPromise) {
        contentShareSizesCancelPromise.resolve(ReportConstants.ABORT);
      }
      contentSharedCancelPromise = $q.defer();
      contentShareSizesCancelPromise = $q.defer();

      var contentSharedOptions = CommonReportService.getCustomerOptions(filter, 'contentShared', CommonReportService.TIME_CHARTS, true);
      var contentShareSizesOptions = CommonReportService.getCustomerOptions(filter, 'contentShareSizes', CommonReportService.TIME_CHARTS, true);
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
        if (contentSharedData !== ReportConstants.ABORT && contentShareSizesData !== ReportConstants.ABORT) {
          return combineFilesShared(contentSharedData, contentShareSizesData, filter);
        } else {
          return ReportConstants.ABORT;
        }
      }, function () {
        if (contentSharedData !== ReportConstants.ABORT && contentShareSizesData !== ReportConstants.ABORT) {
          return combineFilesShared(contentSharedData, contentShareSizesData, filter);
        } else {
          return ReportConstants.ABORT;
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

      var date = '';
      if (contentSharedData[0] && contentShareSizesData[0]) {
        var contentSharedDate = contentSharedData[0].date;
        var contentShareSizesDate = contentShareSizesData[0].date;
        if (contentSharedData.length > 0) {
          date = contentSharedDate;
          if ((contentShareSizesData.length > 0) && (contentSharedDate < contentShareSizesDate)) {
            date = contentShareSizesDate;
          }
        } else if (contentShareSizesData.length > 0) {
          date = contentShareSizesDate;
        }
      }
      var returnGraph = CommonReportService.getReturnGraph(filter, date, graphItem);

      _.forEach(contentSharedData, function (contentItem) {
        var modDate = CommonReportService.getModifiedDate(contentItem.date, filter);

        _.forEach(returnGraph, function (returnItem) {
          if (returnItem.date === modDate) {
            returnItem.contentShared = parseInt(contentItem.count, ReportConstants.INTEGER_BASE);
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
              returnItem.contentShareSizes = parseFloat(shareItem.count).toFixed(ReportConstants.FIXED);
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
        metricsCancelPromise.resolve(ReportConstants.ABORT);
      }
      metricsCancelPromise = $q.defer();
      var returnArray = {
        dataProvider: [],
        displayData: {}
      };
      var options = CommonReportService.getAltCustomerOptions(filter, 'callMetrics', CommonReportService.DETAILED, undefined);

      return CommonReportService.getCustomerReport(options, metricsCancelPromise).then(function (response) {
        var details = _.get(response, 'data.data[0].data[0].details');
        if (details) {
          var totalCalls = parseInt(details.totalCalls, ReportConstants.INTEGER_BASE);
          if (totalCalls > 0) {
            var audioCalls = parseInt(details.sparkUcAudioCalls, ReportConstants.INTEGER_BASE);
            var successfulCalls = parseInt(details.totalSuccessfulCalls, ReportConstants.INTEGER_BASE);
            var videoCalls = parseInt(details.sparkUcVideoCalls, ReportConstants.INTEGER_BASE) + parseInt(details.sparkVideoCalls, ReportConstants.INTEGER_BASE);

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
            returnArray.displayData.totalAudioDuration = parseInt(details.totalAudioDuration, ReportConstants.INTEGER_BASE);
            returnArray.displayData.totalFailedCalls = parseFloat((parseFloat(details.totalFailedCalls) / totalCalls) * ReportConstants.PERCENTAGE_MULTIPLIER).toFixed(ReportConstants.FIXED);
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
        metricsCancelPromise.resolve(ReportConstants.ABORT);
      }
      mediaCancelPromise = $q.defer();

      var options = CommonReportService.getCustomerOptions(filter, 'callQuality', CommonReportService.DETAILED, undefined);
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
          var graph = CommonReportService.getReturnGraph(filter, data[data.length - 1].date, graphItem);

          _.forEach(data, function (item) {
            var totalSum = parseInt(item.details.totalDurationSum, ReportConstants.INTEGER_BASE);
            var goodSum = parseInt(item.details.goodQualityDurationSum, ReportConstants.INTEGER_BASE);
            var fairSum = parseInt(item.details.fairQualityDurationSum, ReportConstants.INTEGER_BASE);
            var poorSum = parseInt(item.details.poorQualityDurationSum, ReportConstants.INTEGER_BASE);
            var partialSum = fairSum + poorSum;

            var goodVideoQualityDurationSum = parseInt(item.details.sparkGoodVideoDurationSum, ReportConstants.INTEGER_BASE) + parseInt(item.details.sparkUcGoodVideoDurationSum, ReportConstants.INTEGER_BASE);
            var fairVideoQualityDurationSum = parseInt(item.details.sparkFairVideoDurationSum, ReportConstants.INTEGER_BASE) + parseInt(item.details.sparkUcFairVideoDurationSum, ReportConstants.INTEGER_BASE);
            var poorVideoQualityDurationSum = parseInt(item.details.sparkPoorVideoDurationSum, ReportConstants.INTEGER_BASE) + parseInt(item.details.sparkUcPoorVideoDurationSum, ReportConstants.INTEGER_BASE);
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
        deviceCancelPromise.resolve(ReportConstants.ABORT);
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
          var details = _.get(item, 'details');
          if (details && responseLength < details.length) {
            responseLength = details.length;
            date = details[responseLength - 1].recordTime;
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
            var registeredDevices = parseInt(detail.totalRegisteredDevices, ReportConstants.INTEGER_BASE);
            var modifiedDate = CommonReportService.getModifiedDate(detail.recordTime, filter);

            _.forEach(tempGraph.graph, function (graphPoint, index) {
              if (graphPoint.date === modifiedDate && (registeredDevices > 0)) {
                graphPoint.totalRegisteredDevices = registeredDevices;
                deviceArray.graphData[0].graph[index].totalRegisteredDevices += registeredDevices;
                tempGraph.emptyGraph = false;
                deviceArray.graphData[0].emptyGraph = false;
              }
            });
          });
          deviceArray.graphData.push(tempGraph);
        });
      }

      return deviceArray;
    }
  }
})();
