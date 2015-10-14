(function () {
  'use strict';

  angular.module('uc.cdrlogsupport')
    .service('CdrService', CdrService);

  /* @ngInject */
  function CdrService($translate, $http, $q, Notification, Log) {
    var proxyData = [];
    var LOCAL = 'localSessionID';
    var REMOTE = 'remoteSessionID';
    var callingDevice = 'calling_deviceName';
    var calledDevice = 'called_deviceName';
    var callingNumber = 'calling_partyNumber';
    var calledNumber = 'called_partyNumber';
    var emptyId = "00000000000000000000000000000000";
    var serverHosts = ['SME-01', 'SME-02', 'CMS-01', 'CMS-02'];

    var baseHeaders = {
      Authorization: 'Basic ' + btoa('huron:4Jd7w6%6~8yB7r4m'),
      Accept: 'application/json, text/plain, */*',
      'Content-type': 'application/x-ww-form-urlencoded'
    };

    var servers = [{
      name: "TX1",
      url: "https://revproxy.hptx1.huron-dev.com:8001/_all/_search?pretty"
    }, {
      name: "TX2",
      url: "https://revproxy.sc-tx2.huron-dev.com:8001/_all/_search?pretty"
    }, {
      name: "TX3",
      url: "https://revproxy.sc-tx3.huron-dev.com:8001/_all/_search?pretty"
    }];

    return {
      query: query,
      formDate: formDate,
      createDownload: createDownload
    };

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

    function query(model) {
      proxyData = [];

      var startTimeUtc = formDate(model.startDate, model.startTime);
      var endTimeUtc = formDate(model.endDate, model.endTime);
      var timeStamp = '"from":' + startTimeUtc + ',"to":' + endTimeUtc;

      var devicesQuery = [];
      var device = null;
      if (angular.isDefined(model.callingPartyDevice)) {
        devicesQuery.push(deviceQuery(callingDevice, model.callingPartyDevice));
      }
      if (angular.isDefined(model.calledPartyDevice)) {
        devicesQuery.push(deviceQuery(calledDevice, model.calledPartyDevice));
      }
      if (angular.isDefined(model.callingPartyNumber)) {
        devicesQuery.push(deviceQuery(callingNumber, model.callingPartyDevice));
      }
      if (angular.isDefined(model.calledPartyNumber)) {
        devicesQuery.push(deviceQuery(calledNumber, model.calledPartyNumber));
      }

      //finalize the JSON Query
      var jsQuery = '{"query": {"filtered": {"query": {"bool": {"should": [' + generateHosts() + ']}},"filter": {"bool": {"must": [{"range": {"@timestamp":{' + timeStamp + '}}}]';

      if (devicesQuery.length > 0) {
        jsQuery += ',"should":[' + devicesQuery + ']';
      }
      jsQuery += '}}} },"size": ' + model.hitSize + ',"sort": [{"@timestamp": {"order": "desc"}}]}';

      var promises = [];
      angular.forEach(servers, function (item, index, array) {
        var headers = angular.copy(baseHeaders);
        headers.server = item.url;
        headers.qs = jsQuery;

        var results = [];
        var proxyPromise = proxy(headers).then(function (response) {
            if (!angular.isUndefined(response.hits.hits) && (response.hits.hits.length > 0)) {
              for (var i = 0; i < response.hits.hits.length; i++) {
                results.push(response.hits.hits[i]._source);
              }
              return secondaryQuery(item, results);
            }
            return;
          },
          function (response) {
            Log.debug('Failed to retrieve cdr data from ' + item.name + ' server. Status: ' + response.status);
            Notification.notify([$translate.instant('cdrLogs.cdrRetrievalError', {
              server: item.name
            })], 'error');
            return;
          });
        promises.push(proxyPromise);
      });

      return $q.all(promises).then(function () {
        return proxyData;
      });
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

    function deviceQuery(callType, device) {
      return '{"fquery":{"query":{"query_string":{"query":"dataParam.' + callType + ':(\\"' + device + '\\")"}},"_cache":true}}';
    }

    function secondaryQuery(server, cdrArray) {
      var sessionIds = extractUniqueIds(cdrArray);
      var newCdrArray = [];
      var promises = [];
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
      angular.forEach(queries, function (item, index, array) {
        item += '"}},"_cache":true}}';

        var headers = angular.copy(baseHeaders);
        headers.server = server.url;
        headers.qs = '{"query": {"filtered": {"query": {"bool": {"should": [' + generateHosts() + ']} },"filter": {"bool": {"should":[' + item + ']}}}},"size": 2000,"sort": [{"@timestamp": {"order": "desc"}}]}';

        var proxyQuery = proxy(headers).then(function (response) {
            if (!angular.isUndefined(response.hits.hits) && (response.hits.hits.length > 0)) {
              for (var i = 0; i < response.hits.hits.length; i++) {
                newCdrArray.push(response.hits.hits[i]._source);
              }
            }
            return;
          },
          function (response) {
            Log.debug('Failed to retrieve cdr data from ' + server.name + ' server. Status: ' + response.status);
            Notification.notify([$translate.instant('cdrLogs.cdrRecursiveError', {
              server: server.name
            })], 'error');
            return;
          });
        promises.push(proxyQuery);
      });

      return $q.all(promises).then(function () {
        groupCdrsIntoCalls(newCdrArray);
        return;
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
        proxyData.push(splitFurther(call));
      }
      return;
    }

    function splitFurther(callGrouping) {
      var callLegs = [];
      var call = JSON.parse(JSON.stringify(callGrouping));

      var tempArray = [];
      while (call.length > 0) {
        tempArray.push(call[0]);
        call.splice(0, 1);
        for (var i = 0; i < call.length; i++) {
          if (call[i].dataParam.localSessionID === tempArray[0].dataParam.localSessionID && call[i].dataParam.remoteSessionID === tempArray[0].dataParam.remoteSessionID || call[i].dataParam.remoteSessionID === tempArray[0].dataParam.localSessionID && call[i].dataParam.localSessionID === tempArray[0].dataParam.remoteSessionID) {
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

    function proxy(header) {
      var defer = $q.defer();
      $http({
          method: "GET",
          url: 'http://localhost:8080',
          headers: header
        })
        .success(function (response) {
          defer.resolve(response);
        })
        .error(function (response, status) {
          defer.reject({
            'response': response,
            'status': status
          });
        });
      return defer.promise;
    }
  }
})();
