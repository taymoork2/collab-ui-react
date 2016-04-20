(function () {
  'use strict';

  angular
    .module('uc.cdrlogsupport')
    .controller('CdrLadderDiagramCtrl', CdrLadderDiagramCtrl);

  /* @ngInject */
  function CdrLadderDiagramCtrl($scope, $rootScope, $filter, $state, $translate, $stateParams, CdrService, CdrLadderDiagramService, $sce, Log) {
    var vm = this;

    vm.downLoadLabel = $translate.instant('cdrLadderDiagram.downLoadEvents');

    vm.uniqueIds = $stateParams.uniqueIds;
    vm.call = $stateParams.call;
    vm.events = $stateParams.events;
    vm.imported = $stateParams.imported;
    var logstashPath = $stateParams.logstashPath;

    vm.diagramXML = "";
    vm.diagramHTML = "";
    vm.downloadReady = false;
    vm.isFilterCollapsed = true;
    vm.isDownloadCollapsed = true;
    vm.isCallIdsCollapsed = true;
    vm.isHostNameCollapsed = true;

    vm.filterCallIdOptions = [];
    vm.SessionIDPairsFilterOptions = [];
    vm.isSessionIDPairsCollapsed = true;
    vm.filterHostNamefilterOptions = [];

    vm.diagramGenerated = false;
    vm.FilterSelectisOpen = false;
    vm.spin = false;
    vm.error = '';

    vm.close = function () {
      clearDownloads();
      $state.modal.close();
    };

    $scope.$on('event-query-resolved', function (event, args) {
      generateLadderDiagram();
    });

    function generateDownloadFilterOptions() {
      generateDownloads();
      populateCallIdFilterOptions();
      populateSessionIDPairsFilterOptions();
      populateHostNamefilterOptions();
    }

    function extractXmlDiagramInfo() {
      var htmlString = vm.diagramHTML.toString();
      vm.diagramXML = $sce.trustAsHtml(htmlString.substring(htmlString.indexOf("<?xml"), htmlString.indexOf("</svg>") + 6));
    }

    function generateDownloads() {
      var jsonFileData = {
        cdrs: vm.call,
        events: vm.events
      };
      var jsonBlob = new Blob([JSON.stringify(jsonFileData, null, 2)], {
        type: 'application/json'
      });
      vm.jsonUrl = (window.URL || window.webkitURL).createObjectURL(jsonBlob);

      var csvBlob = new Blob([convertCsv()], {
        type: 'text/csv'
      });
      vm.csvUrl = (window.URL || window.webkitURL).createObjectURL(csvBlob);

      var htmlBlob = new Blob([vm.diagramHTML], {
        type: 'text/html'
      });
      vm.htmlUrl = (window.URL || window.webkitURL).createObjectURL(htmlBlob);

      vm.downloadReady = true;
    }

    function clearDownloads() {
      if (vm.jsonUrl !== null) {
        (window.URL || window.webkitURL).revokeObjectURL(vm.jsonUrl);
      }

      if (vm.csvUrl !== null) {
        (window.URL || window.webkitURL).revokeObjectURL(vm.csvUrl);
      }

      if (vm.htmlUrl !== null) {
        (window.URL || window.webkitURL).revokeObjectURL(vm.htmlUrl);
      }
    }

    vm.query = function () {
      var esQuery = generateQueryJson(generateEventSourceJson(), generateSessionIdJson());
      vm.error = '';
      vm.spin = true;

      CdrLadderDiagramService.query(esQuery, logstashPath).then(
        function (response) {
          if (response.hits.hits.length > 0) {
            vm.events = formatEventsResponse(response);
            $rootScope.$broadcast('event-query-resolved');
          } else {
            vm.error = 'Response was undefined';
            vm.spin = false;
          }
        },
        function (response) {
          vm.error = esErrorResponse(response);
          vm.spin = false;
        });
      return;
    };

    function generateEventSourceJson() {
      var eventSourceJson = '';
      eventSourceJson += '{"query_string":{"query":"CallTrace.Release"}},';
      eventSourceJson += '{"query_string":{"query":"CallTrace.Split"}},';
      eventSourceJson += '{"query_string":{"query":"CallTrace.SetupReq"}},';
      eventSourceJson += '{"query_string":{"query":"CallTrace.Reject"}},';
      eventSourceJson += '{"query_string":{"query":"CallTrace.Join"}},';
      eventSourceJson += '{"query_string":{"query":"CallTrace.SIPEvent"}},';
      eventSourceJson += '{"query_string":{"query":"sipmsg"}}';
      return eventSourceJson;
    }

    function generateSessionIdJson() {
      var sessionIdJson = '';
      if (vm.uniqueIds.length > 0) {
        sessionIdJson += '{"query":"';
        for (var i = 0; i < vm.uniqueIds.length; i++) {
          sessionIdJson += vm.uniqueIds[i];
          if (i + 1 < vm.uniqueIds.length) {
            sessionIdJson += ' OR ';
          }
        }
        sessionIdJson += '"}';
      }
      return sessionIdJson;
    }

    function generateQueryJson(eventSources, sessionIds) {
      var query = '{"query": {"filtered": {"query": {"bool": {"should": [' + eventSources + ']}}, "filter": {"bool": {"should":[{"fquery": {"query":{"query_string":' + sessionIds + '}, "_cache": true}}]}}}}, "size": 2000, "sort": [{"@timestamp": {"order": "desc"}}]}';
      return query;
    }

    function formatEventsResponse(response) {
      var events = [];

      var dataResponse = response.hits.hits;
      var singleEvent = {};
      for (var i = 0; i < dataResponse.length; i++) {
        if (dataResponse[i]._source !== undefined && dataResponse[i]._source['type'] !== 'udp_json_event') {
          singleEvent = dataResponse[i]._source;
          events.push(singleEvent);
        }
      }
      events = $filter('orderBy')(events, ['"@timestamp"']);
      return events;
    }

    function generateCsvCallHeader() {
      var maxSize = 0;
      var maxIndex = 0;
      for (var i = 0; i < vm.call.length; i++) {
        if (Object.keys(vm.call[i]['dataParam']).length > maxSize) {
          maxSize = Object.keys(vm.call[i]['dataParam']).length;
          maxIndex = i;
        }
      }

      var dataParamKeys = Object.keys(vm.call[maxIndex]['dataParam']);
      var csvCallHeader = '';
      for (var dpi = 0; dpi < dataParamKeys.length; dpi++) {
        csvCallHeader += dataParamKeys[dpi];
        csvCallHeader += ',';
      }
      csvCallHeader = csvCallHeader.slice(0, -1);
      csvCallHeader += '\n';
      return csvCallHeader;
    }

    function generateCsvCallBody() {
      var maxSize = 0;
      var maxIndex = 0;
      for (var i = 0; i < vm.call.length; i++) {
        if (Object.keys(vm.call[i]['dataParam']).length > maxSize) {
          maxSize = Object.keys(vm.call[i]['dataParam']).length;
          maxIndex = i;
        }
      }

      var dataParamKeys = Object.keys(vm.call[maxIndex]['dataParam']);

      var csvCallBody = '';
      for (i = 0; i < vm.call.length; i++) {
        for (var dpi = 0; dpi < dataParamKeys.length; dpi++) {
          if (vm.call[i]['dataParam'][dataParamKeys[dpi]] !== undefined) {
            // we have to use replace becasue sometimes paramaters have ',' which messes up csv
            if (typeof vm.call[i]['dataParam'][dataParamKeys[dpi]] == 'string') {
              csvCallBody += (vm.call[i]['dataParam'][dataParamKeys[dpi]]).replace(/,/g, ' ');
            } else {
              csvCallBody += vm.call[i]['dataParam'][dataParamKeys[dpi]];
            }
          }
          csvCallBody += ',';
        }
        csvCallBody += '\n';
      }
      return csvCallBody.slice(0, -2);
    }

    function generateCsvEventHeader() {
      // logic required because sip messages have more dataParams than other events
      var firstSipMsgIndex = 0;
      while (vm.events[firstSipMsgIndex]['id'] !== 'sipmsg') {
        firstSipMsgIndex++;
      }
      var dataParamKeys = Object.keys(vm.events[firstSipMsgIndex]['dataParam']);
      dataParamKeys.push('remoteName');
      dataParamKeys.splice(dataParamKeys.indexOf('rawMsg'), 1);
      var eventSourceKeys = Object.keys(vm.events[firstSipMsgIndex]['eventSource']);
      var keys = ['@timestamp', '@version', 'eventType', 'host', 'hostAddress', 'id', 'indexName', 'level', 'portAddress', 'record_type', 'serviceID', 'timeReceived', 'ts', 'type', 'message'];

      var csvEventHeader = 'Index,';
      for (var dpi = 0; dpi < dataParamKeys.length; dpi++) {
        csvEventHeader += dataParamKeys[dpi];
        csvEventHeader += ',';
      }
      for (var esi = 0; esi < eventSourceKeys.length; esi++) {
        csvEventHeader += eventSourceKeys[esi];
        csvEventHeader += ',';
      }
      for (var ki = 0; ki < keys.length; ki++) {
        csvEventHeader += keys[ki];
        csvEventHeader += ',';
      }
      csvEventHeader = csvEventHeader.slice(0, -1);
      csvEventHeader += '\n';
      return csvEventHeader;
    }

    function generateCsvEventBody() {
      var firstSipMsgIndex = 0;
      while (vm.events[firstSipMsgIndex]['id'] !== 'sipmsg') {
        firstSipMsgIndex++;
      }
      var dataParamKeys = Object.keys(vm.events[firstSipMsgIndex]['dataParam']);
      dataParamKeys.push('remoteName');
      dataParamKeys.splice(dataParamKeys.indexOf('rawMsg'), 1);
      var eventSourceKeys = Object.keys(vm.events[firstSipMsgIndex]['eventSource']);
      var keys = ['@timestamp', '@version', 'eventType', 'host', 'hostAddress', 'id', 'indexName', 'level', 'portAddress', 'record_type', 'serviceID', 'timeReceived', 'ts', 'type', 'message'];

      var csvEventBody = '';
      vm.events = $filter('orderBy')(vm.events, ['"@timestamp"']);
      for (var i = 0; i < vm.events.length; i++) {
        csvEventBody += (i + 1 + ',');
        for (var dpi = 0; dpi < dataParamKeys.length; dpi++) {
          // Ctrl + Y(i);
          if (vm.events[i]['dataParam'] !== undefined) {
            if (vm.events[i]['dataParam'][dataParamKeys[dpi]] !== undefined) {
              csvEventBody += vm.events[i]['dataParam'][dataParamKeys[dpi]];
            }
          }
          csvEventBody += ',';
        }
        for (var esi = 0; esi < eventSourceKeys.length; esi++) {
          if (vm.events[i]['eventSource'] !== undefined) {
            if (vm.events[i]['eventSource'][eventSourceKeys[esi]] !== undefined) {
              csvEventBody += vm.events[i]['eventSource'][eventSourceKeys[esi]];
            }
          }
          csvEventBody += ',';
        }
        for (var ki = 0; ki < keys.length; ki++) {
          if (vm.events[i][keys[ki]] !== undefined) {
            csvEventBody += vm.events[i][keys[ki]];
          }
          csvEventBody += ',';
        }
        csvEventBody += '\n';
      }
      return csvEventBody.slice(0, -2);
    }

    function convertCsv() {
      var csvFormat = '';
      // Ctrl + Y(vm.events);
      csvFormat += generateCsvCallHeader();
      csvFormat += generateCsvCallBody();

      csvFormat += '\n\n\n';

      csvFormat += generateCsvEventHeader();
      csvFormat += generateCsvEventBody();

      return csvFormat;
    }

    function generateLadderDiagram() {
      vm.error = '';
      vm.spin = true;
      CdrLadderDiagramService.createLadderDiagram(vm.events).then(
        function (response) {
          Log.debug('Success to retrieve ladder diagram');
          vm.diagramHTML = $sce.trustAsHtml(response);
          vm.spin = false;
          vm.diagramGenerated = true;
          extractXmlDiagramInfo();
          generateDownloadFilterOptions();
        },
        function (response) {
          Log.debug('Failed to retrieve ladder diagram');
          vm.error = diagnosticErrorResponse(response);
          vm.spin = false;
        });
    }

    vm.reloadLadderDiagram = function (filterType) {
      vm.error = '';
      vm.spin = true;
      vm.diagramXML = '';
      vm.diagramHTML = '';
      if (filterType === 'callId') {
        vm.filteredEvents = callIdFilter();
      } else if (filterType === 'sessionPair') {
        vm.filteredEvents = new SessionIDPairsFilter();
      } else if (filterType === 'hostName') {
        vm.filteredEvents = hostNameFilter();
      } else if (filterType === 'all') {
        vm.filteredEvents = _.union(callIdFilter(), new SessionIDPairsFilter(), hostNameFilter());
      } else {
        return;
      }

      CdrLadderDiagramService.createLadderDiagram(vm.filteredEvents).then(
        function (response) {
          vm.diagramHTML = $sce.trustAsHtml(response);
          vm.spin = false;
          vm.diagramGenerated = true;
          extractXmlDiagramInfo();
        },
        function (response) {
          vm.error = diagnosticErrorResponse(response);
          vm.spin = false;
        });
    };

    function extractUniqueCallIds(events) {
      if (events === undefined) {
        return [];
      }
      var uniqueCallIds = [];
      for (var i = 0; i < events.length; i++) {
        if (events[i].dataParam !== undefined) {
          if (uniqueCallIds.indexOf(events[i].dataParam.callID) < 0 && events[i].dataParam.callID !== undefined) {
            uniqueCallIds.push(events[i].dataParam.callID);
          }
        }
      }
      return uniqueCallIds;
    }

    function populateCallIdFilterOptions() {
      var uniqueCallIds = extractUniqueCallIds(vm.events);
      vm.filterCallIdOptions = [];
      var tempObj = {};
      for (var i = 0; i < uniqueCallIds.length; i++) {
        tempObj.label = uniqueCallIds[i];
        tempObj.value = true;
        vm.filterCallIdOptions.push(tempObj);
        tempObj = {};
      }
    }

    function callIdFilter() {
      var filtered = [];
      for (var i = 0; i < vm.filterCallIdOptions.length; i++) {
        if (vm.filterCallIdOptions[i].value === true) {
          filtered = _.union(filtered, $filter('filter')(vm.events, {
            dataParam: {
              callID: vm.filterCallIdOptions[i].label
            }
          }));
        }
      }
      return filtered;
    }

    function extractUniqueSessionIDPairs(events) {
      if (vm.call === undefined) {
        return [];
      }
      var uniqueSessionIDPairs = [];
      for (var i = 0; i < vm.call.length; i++) {
        if (uniqueSessionIDPairs.indexOf(vm.call[i].dataParam.localSessionID + ' / ' + vm.call[i].dataParam.remoteSessionID) < 0) {
          uniqueSessionIDPairs.push(vm.call[i].dataParam.localSessionID + ' / ' + vm.call[i].dataParam.remoteSessionID);
        }
      }
      return uniqueSessionIDPairs;
    }

    function populateSessionIDPairsFilterOptions() {
      var uniqueSessionIDPairs = extractUniqueSessionIDPairs(vm.events);
      vm.SessionIDPairsFilterOptions = [];
      var tempObj = {};
      for (var i = 0; i < uniqueSessionIDPairs.length; i++) {
        tempObj.label = uniqueSessionIDPairs[i];
        tempObj.value = true;
        vm.SessionIDPairsFilterOptions.push(tempObj);
        tempObj = {};
      }
    }

    function SessionIDPairsFilter() {
      var filtered = [];
      for (var i = 0; i < vm.SessionIDPairsFilterOptions.length; i++) {
        if (vm.SessionIDPairsFilterOptions[i].value === true) {
          var sessionIds = vm.SessionIDPairsFilterOptions[i].label.split(' / ');
          filtered = _.union(filtered, $filter('filter')(vm.events, {
            dataParam: {
              localSessionID: sessionIds[0],
              remoteSessionID: sessionIds[1]
            }
          }));
          filtered = _.union(filtered, $filter('filter')(vm.events, {
            dataParam: {
              localSessionID: sessionIds[1],
              remoteSessionID: sessionIds[0]
            }
          }));
        }
      }
      return filtered;
    }

    function extractUniqueHostNames(events) {
      if (events === undefined) {
        return [];
      }
      var uniqueHostNames = [];
      for (var i = 0; i < events.length; i++) {
        if (events[i].eventSource !== undefined) {
          if (uniqueHostNames.indexOf(events[i].eventSource.hostname) < 0 && events[i].eventSource.hostname !== undefined) {
            uniqueHostNames.push(events[i].eventSource.hostname);
          }
        }
      }
      return uniqueHostNames;
    }

    function populateHostNamefilterOptions() {
      var uniqueHostNames = extractUniqueHostNames(vm.events);
      vm.filterHostNamefilterOptions = [];
      var tempObj = {};
      for (var i = 0; i < uniqueHostNames.length; i++) {
        tempObj.label = uniqueHostNames[i];
        tempObj.value = true;
        vm.filterHostNamefilterOptions.push(tempObj);
        tempObj = {};
      }
    }

    function hostNameFilter() {
      var filtered = [];
      for (var i = 0; i < vm.filterHostNamefilterOptions.length; i++) {
        if (vm.filterHostNamefilterOptions[i].value === true) {
          filtered = _.union(filtered, $filter('filter')(vm.events, {
            eventSource: {
              hostname: vm.filterHostNamefilterOptions[i].label
            }
          }));
        }
      }
      return filtered;
    }

    function esErrorResponse(response) {
      var message = '';
      if (response.status === 401 || response.status === 403) {
        message = $translate.instant('cdrLogs.cdr401And403Error');
      } else if (response.status === 404) {
        message = $translate.instant('cdrLogs.cdr404Error');
      } else if (response.status === 408) {
        message = $translate.instant('cdrLogs.cdr408Error');
      } else if (response.status === 502 || response.status === 503) {
        message = $translate.instant('cdrLogs.cdr502And503Error');
      } else {
        message = $translate.instant('cdrLogs.cdr500ShortError');
      }
      return message;
    }

    function diagnosticErrorResponse(response) {
      var message = '';
      if (response.status === 401 || response.status === 403) {
        message = $translate.instant('cdrLadderDiagram.401And403Error');
      } else if (response.status === 404) {
        message = $translate.instant('cdrLadderDiagram.404Error');
      } else if (response.status === 408) {
        message = $translate.instant('cdrLadderDiagram.408Error');
      } else if (response.status === 502 || response.status === 503) {
        message = $translate.instant('cdrLadderDiagram.502And503Error');
      } else {
        message = $translate.instant('cdrLadderDiagram.500Error');
      }
      return message;
    }

    function init() {
      if (!vm.imported) {
        vm.query();
      }
    }

    init();
  }
})();
