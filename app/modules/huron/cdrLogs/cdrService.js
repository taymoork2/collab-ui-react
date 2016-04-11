(function () {
  'use strict';

  angular.module('uc.cdrlogsupport')
    .service('CdrService', CdrService);

  /* @ngInject */
  function CdrService($rootScope, $translate, $http, $q, Authinfo, Config, Notification, Log, UrlConfig) {
    var proxyData = [];
    var ABORT = 'ABORT';
    var LOCAL = 'localSessionID';
    var REMOTE = 'remoteSessionID';
    var callingUser = 'calling_userUUID';
    var calledUser = 'called_userUUID';
    var callingDevice = 'calling_deviceName';
    var calledDevice = 'called_deviceName';
    var callingNumber = 'calling_partyNumber';
    var calledNumber = 'called_partyNumber';
    var callingTenant = 'calling_customerUUID';
    var calledTenant = 'called_customerUUID';
    var emptyId = "00000000000000000000000000000000";
    var serverHosts = ['SME-01', 'SME-02', 'CMS-01', 'CMS-02'];

    var retryError = "ElasticSearch GET request failed for reason: Observable onError";
    var cancelPromise = null;
    var currentJob = null;
    var cdrUrl = null;

    return {
      query: query,
      formDate: formDate,
      createDownload: createDownload,
      extractUniqueIds: extractUniqueIds,
      proxy: proxy
    };

    function getUser(userName, calltype) {
      var defer = $q.defer();
      var name = userName.replace(/@/g, '%40').replace(/\+/g, '%2B');
      var url = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '?filter=username eq \"' + name + '\"';

      $http.get(url).success(function (data, status) {
        if (angular.isArray(data.Resources) && (data.Resources.length > 0)) {
          defer.resolve(data.Resources[0].id);
        } else {
          Log.debug('User does not exist in this org.');
          Notification.notify([$translate.instant('cdrLogs.nonexistentUser', {
            calltype: calltype
          })], 'error');
          defer.reject(null);
        }
      }).error(function (data, status) {
        Log.debug('Failed to retrieve user data. Status: ' + status);
        Notification.notify([$translate.instant('cdrLogs.userDataError')], 'error');
        defer.reject(null);
      });

      return defer.promise;
    }

    function createDownload(call) {
      var jsonFileData = {
        cdrs: call
      };
      var jsonBlob = new Blob([JSON.stringify(jsonFileData)], {
        type: 'application/json'
      });
      return (window.URL || window.webkitURL).createObjectURL(jsonBlob);
    }

    function formDate(date, time) {
      var returnDate = moment(date);
      if (time.substring(9, 10).toLowerCase() === 'p') {
        returnDate.hours(parseInt(time.substring(0, 2)) + 12);
      } else {
        returnDate.hours(parseInt(time.substring(0, 2)));
      }
      returnDate.minutes(parseInt(time.substring(3, 5)));
      returnDate.seconds(parseInt(time.substring(6, 8)));
      return returnDate.utc();
    }

    function query(model, logstashPath) {
      cdrUrl = UrlConfig.getCdrUrl() + logstashPath + "/_search?pretty";
      proxyData = [];
      if (cancelPromise !== null && cancelPromise !== undefined) {
        cancelPromise.resolve(ABORT);
      }
      cancelPromise = $q.defer();
      currentJob = Math.random();
      var thisJob = angular.copy(currentJob);

      var startTimeUtc = formDate(model.startDate, model.startTime);
      var endTimeUtc = formDate(model.endDate, model.endTime);
      var timeStamp = '"from":' + startTimeUtc + ',"to":' + endTimeUtc;
      var devicesQuery = [];
      var promises = [];
      var userUuidRetrieved = true;

      if (angular.isDefined(model.callingUser) && (model.callingUser !== '')) {
        var callingUserPromse = convertUuid(model.callingUser, $translate.instant('cdrLogs.callingParty')).then(function (callingUUID) {
          if (callingUUID !== null) {
            devicesQuery.push(deviceQuery(callingUser, callingUUID));
          } else {
            userUuidRetrieved = false;
          }
        });
        promises.push(callingUserPromse);
      }
      if (angular.isDefined(model.calledUser) && (model.calledUser !== '')) {
        var calledUserPromse = convertUuid(model.calledUser, $translate.instant('cdrLogs.calledParty')).then(function (calledUUID) {
          if (calledUUID !== null) {
            devicesQuery.push(deviceQuery(calledUser, calledUUID));
          } else {
            userUuidRetrieved = false;
          }
        });
        promises.push(calledUserPromse);
      }

      return $q.all(promises).then(function () {
        var queryPromises = [];

        if (userUuidRetrieved) {
          if (angular.isDefined(model.callingPartyDevice) && (model.callingPartyDevice !== '')) {
            devicesQuery.push(deviceQuery(callingDevice, model.callingPartyDevice));
          }
          if (angular.isDefined(model.calledPartyDevice) && (model.calledPartyDevice !== '')) {
            devicesQuery.push(deviceQuery(calledDevice, model.calledPartyDevice));
          }
          if (angular.isDefined(model.callingPartyNumber) && (model.callingPartyNumber !== '')) {
            devicesQuery.push(deviceQuery(callingNumber, model.callingPartyNumber));
          }
          if (angular.isDefined(model.calledPartyNumber) && (model.calledPartyNumber !== '')) {
            devicesQuery.push(deviceQuery(calledNumber, model.calledPartyNumber));
          }

          //finalize the JSON Query
          var jsQuery = '{"query": {"filtered": {"query": {"bool": {"should": [' + generateHosts() + ']}},"filter": {"bool": {"must": [{"range": {"@timestamp":{' + timeStamp + '}}}]';
          if (devicesQuery.length > 0) {
            jsQuery += ',"should":[' + devicesQuery + ']';
          }
          jsQuery += '}}} },"size": ' + model.hitSize + ',"sort": [{"@timestamp": {"order": "desc"}}]}';
          var results = [];

          var callingPromise = proxy(jsQuery, angular.copy(thisJob)).then(function (response) {
              if (!angular.isUndefined(response.hits.hits) && (response.hits.hits.length > 0)) {
                for (var i = 0; i < response.hits.hits.length; i++) {
                  results.push(response.hits.hits[i]._source);
                }
                return recursiveQuery(results, thisJob).then(function (response) {
                  if (response !== ABORT) {
                    return proxyData;
                  } else {
                    return response;
                  }
                }, function (response) {
                  if (response !== ABORT) {
                    return;
                  } else {
                    return response;
                  }
                });
              }
              return;
            },
            function (response) {
              return errorResponse(response);
            });
          queryPromises.push(callingPromise);
        }

        return $q.all(queryPromises).then(function () {
          if (thisJob === currentJob) {
            return proxyData;
          } else {
            return ABORT;
          }
        });
      });
    }

    function convertUuid(uuid, calltype) {
      var defer = $q.defer();
      getUser(uuid, calltype).then(function (response) {
        if ((response === null) && (uuid.length === 36) && /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(uuid)) {
          defer.resolve(uuid);
        } else {
          defer.resolve(response);
        }
      }, function (response) {
        defer.resolve(response);
      });

      return defer.promise;
    }

    function generateHosts() {
      var hostsJson = '{"query_string":{"query":"id:CDR.CDR"}},';
      angular.forEach(serverHosts, function (host, index, array) {
        hostsJson += '{"query_string":{"query":"id:CDR.CDR AND eventSource.hostname:\\"' + host + '\\""}}';
        if (index + 1 < serverHosts.length) {
          hostsJson += ',';
        }
      });
      return hostsJson;
    }

    function deviceQuery(callType, item) {
      return '{"fquery":{"query":{"query_string":{"query":"dataParam.' + callType + ':(\\"' + item + '\\")"}},"_cache":true}}';
    }

    function recursiveQuery(cdrArray, thisJob) {
      var sessionIds = extractUniqueIds(cdrArray);
      var queries = [];
      var x = 0;
      var y = 0;
      var queryElement = '{"fquery":{"query":{"query_string":{"query":"';
      queries.push(queryElement);

      // break down the queries to a max of twenty local/remote combinations to make the requests small for TX2
      for (var i = 0; i < sessionIds.length; i++) {
        queries[x] += 'dataParam.localSessionID:(\\"' + sessionIds[i] + '\\") OR dataParam.remoteSessionID:(\\"' + sessionIds[i] + '\\")';
        y++;

        if (i + 1 < sessionIds.length && (y !== 20)) {
          queries[x] += ' OR ';
        }
        if (y === 20) {
          y = 0;
          x++;
          queries.push(queryElement);
        }
      }

      return secondaryQuery(queries, thisJob).then(function (newCdrArray) {
        if (newCdrArray !== ABORT) {
          var newSessionIds = extractUniqueIds(newCdrArray);
          if (newSessionIds.sort().join(',') !== sessionIds.sort().join(',')) {
            return recursiveQuery(newCdrArray, thisJob);
          } else {
            groupCdrsIntoCalls(newCdrArray);
            return;
          }
        } else {
          return ABORT;
        }
      });
    }

    function secondaryQuery(queryArray, thisJob) {
      var cdrArray = [];
      var item = queryArray.shift() + '"}},"_cache":true}}';
      var jsQuery = '{"query": {"filtered": {"query": {"bool": {"should": [' + generateHosts() + ']} },"filter": {"bool": {"should":[' + item + ']}}}},"size": 2000,"sort": [{"@timestamp": {"order": "desc"}}]}';

      return proxy(jsQuery, thisJob).then(function (response) {
          if (!angular.isUndefined(response.hits.hits) && (response.hits.hits.length > 0)) {
            for (var i = 0; i < response.hits.hits.length; i++) {
              cdrArray.push(response.hits.hits[i]._source);
            }
          }

          if (queryArray.length > 0) {
            return secondaryQuery(queryArray, thisJob).then(function (newCdrArray) {
              if (angular.isDefined(newCdrArray)) {
                cdrArray.concat(newCdrArray);
              }
              return cdrArray;
            });
          } else {
            return cdrArray;
          }
        },
        function (response) {
          if (response.status === -1) {
            return ABORT;
          } else {
            return errorResponse(response);
          }
        });
    }

    function extractUniqueIds(cdrArray) {
      if (!angular.isDefined(cdrArray)) {
        return [];
      }
      var uniqueIds = [];

      for (var i = 0; i < cdrArray.length; i++) {
        if (uniqueIds.indexOf(cdrArray[i].dataParam.localSessionID) < 0 && cdrArray[i].dataParam.localSessionID !== emptyId) {
          uniqueIds.push(cdrArray[i].dataParam.localSessionID);
        }
        if (uniqueIds.indexOf(cdrArray[i].dataParam.remoteSessionID) < 0 && cdrArray[i].dataParam.remoteSessionID !== emptyId) {
          uniqueIds.push(cdrArray[i].dataParam.remoteSessionID);
        }
      }
      return uniqueIds;
    }

    function groupCdrsIntoCalls(cdrArray) {
      var x = 0;
      while (cdrArray.length > 0) {
        var call = [];
        call.push(cdrArray[0]);
        cdrArray.splice(0, 1);
        for (var i = 0; i < cdrArray.length; i++) {
          for (var j = 0; j < call.length; j++) {
            if ((call[j].dataParam.localSessionID === cdrArray[i].dataParam[LOCAL] && emptyId !== cdrArray[i].dataParam[LOCAL]) ||
              (call[j].dataParam.remoteSessionID === cdrArray[i].dataParam[REMOTE] && emptyId !== cdrArray[i].dataParam[REMOTE]) ||
              (call[j].dataParam.localSessionID === cdrArray[i].dataParam[REMOTE] && emptyId !== cdrArray[i].dataParam[REMOTE]) ||
              (call[j].dataParam.remoteSessionID === cdrArray[i].dataParam[LOCAL] && emptyId !== cdrArray[i].dataParam[LOCAL])) {

              call.push(cdrArray[i]);
              cdrArray.splice(i, 1);
              if (cdrArray.length > 0) {
                i = 0;
              } else {
                break;
              }
            }
          }
        }
        proxyData.push(splitFurther(call, x));
        x++;
      }
      return;
    }

    function splitFurther(callGrouping, callNum) {
      var callLegs = [];
      var call = JSON.parse(JSON.stringify(callGrouping));
      var x = -1;

      var tempArray = [];
      while (call.length > 0) {
        x++;
        call[0].name = "call" + callNum + "CDR" + x;
        tempArray.push(call[0]);
        call.splice(0, 1);
        for (var i = 0; i < call.length; i++) {
          if (call[i].dataParam.localSessionID === tempArray[0].dataParam.localSessionID && call[i].dataParam.remoteSessionID === tempArray[0].dataParam.remoteSessionID ||
            call[i].dataParam.remoteSessionID === tempArray[0].dataParam.localSessionID && call[i].dataParam.localSessionID === tempArray[0].dataParam.remoteSessionID) {
            x++;
            call[0].name = "call" + callNum + "CDR" + x;
            tempArray.push(call[i]);
            call.splice(i, 1);
            if (call.length > 0) {
              // because i++ is applied before looping
              i = -1;
            } else {
              break;
            }
          }
        }
        callLegs.push(tempArray);
        tempArray = [];
      }
      return callLegs;
    }

    function setCurrentJobId(jobId) {
      currentJob = jobId;
    }

    function proxy(query, thisJob) {
      var defer = $q.defer();
      if (thisJob === currentJob) {
        $http({
          method: "POST",
          url: cdrUrl,
          data: query,
          timeout: cancelPromise.promise
        }).success(function (response) {
          defer.resolve(response);
        }).error(function (response, status) {
          // if this specific error is received, retry once; error cause unknown
          if (status === 500 && response === retryError) {
            $http({
              method: "POST",
              url: cdrUrl,
              data: query,
              timeout: cancelPromise.promise
            }).success(function (secondaryResponse) {
              defer.resolve(secondaryResponse);
            }).error(function (secondaryResponse, secondaryStatus) {
              defer.reject({
                'response': secondaryResponse,
                'status': secondaryStatus
              });
            });
          } else {
            defer.reject({
              'response': response,
              'status': status
            });
          }
        });
      } else {
        defer.reject({
          'response': "",
          'status': -1
        });
      }

      return defer.promise;
    }

    function errorResponse(response) {
      if (response.status === -1) {
        return ABORT;
      } else if (response.status === 401 || response.status === 403) {
        Log.debug('User not authorized to retrieve cdr data from server. Status: ' + response.status);
        Notification.notify([$translate.instant('cdrLogs.cdr401And403Error')], 'error');
      } else if (response.status === 404) {
        Log.debug('Elastic Search unable to respond. Status: ' + response.status);
        Notification.notify([$translate.instant('cdrLogs.cdr404Error')], 'error');
      } else if (response.status === 408) {
        Log.debug('Request timed out while waiting for a response. Status: ' + response.status);
        Notification.notify([$translate.instant('cdrLogs.cdr408Error')], 'error');
      } else if (response.status === 409) {
        Log.debug('Request failed due to a processing conflict. Status: ' + response.status);
        Notification.notify([$translate.instant('cdrLogs.cdr409Error')], 'error');
      } else if (response.status === 502 || response.status === 503) {
        Log.debug('Elastic Search is temporarily unavailable. Status: ' + response.status);
        Notification.notify([$translate.instant('cdrLogs.cdr502And503Error')], 'error');
      } else {
        Log.debug('Request failed due to an error with Elastic Search. Status: ' + response.status);
        Notification.notify([$translate.instant('cdrLogs.cdr500Error')], 'error');
      }
      return;
    }
  }
})();
