(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .service('MeetingsReportService', MeetingsReportService);
  /* @ngInject */
  function MeetingsReportService($http, Authinfo, UrlConfig, $translate) {
    var urlBase = UrlConfig.getAthenaServiceUrl() + '/organizations/' + Authinfo.getOrgId();
    var allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    var meetingMetricsLink = '/meeting_metrics';
    var totalParticipantLink = '';
    var meetingLocationLink = '';
    var meetingTypesLink = '/meeting_types_count';
    var meetingTypesDurationLink = '/meeting_types_duration';
    var shriniURL = 'http://10.196.5.245:8080/athena/api/v1/organizations/27f564b5-37f4-4b2d-a896-622ebb973506';
    function extractDataFromResponse(res) {
      return _.get(res, 'data');
    }

    function getMeetingTypeDurationData(time, cluster) {
      var url = shriniURL + getQuerys(meetingTypesDurationLink, cluster, time);

      return $http.get(url).then(extractDataFromResponse);
    }

    function getMeetingMetrics(time, cluster) {
      var url = shriniURL + getQuerys(meetingMetricsLink, cluster, time);

      return $http.get(url).then(extractDataFromResponse);
    }

    function getTotalMeetings(time, cluster) {
      var url = urlBase + getQuerys(meetingMetricsLink, cluster, time);

      return $http.get(url).then(extractDataFromResponse);
    }

    function getTotalMinutes(time, cluster) {
      var url = urlBase + getQuerys(meetingMetricsLink, cluster, time);

      return $http.get(url).then(extractDataFromResponse);
    }

    function getTotalParticipant(time, cluster) {
      var url = urlBase + getQuerys(totalParticipantLink, cluster, time);

      return $http.get(url).then(extractDataFromResponse);
    }

    function getMeetingLocationData(time, cluster) {
      var url = urlBase + getQuerys(meetingLocationLink, cluster, time);
      return $http.get(url).then(extractDataFromResponse);

      /*      var res = {
              'cluster': cluster,
              'time': time,
              'dataProvider': [{
                'name': 'Czech Republic',
                'value': 356.9
              }, {
                'name': 'Ireland',
                'value': 131.1
              }, {
                'name': 'Germany',
                'value': 115.8
              }, {
                'name': 'Australia',
                'value': 109.9
              }, {
                'name': 'Austria',
                'value': 108.3
              }, {
                'name': 'UK',
                'value': 65
              }, {
                'name': 'Belgium',
                'value': 20
              }]
            };

            var deferred = $q.defer();

            $timeout(function() {
              deferred.resolve(res);
            }, 3000);
            return deferred.promise;
      */
    }

    function getMeetingTypeData(time, cluster) {
      var url = shriniURL + getQuerys(meetingTypesLink, cluster, time);
      return $http.get(url).then(extractDataFromResponse);
      /*  var res = {
        'cluster': cluster,
        'time': time,
        'dataProvider': [{
          'name': 'Browser',
          'value': 70
        }, {
          'name': 'Mobile Android',
          'value': 54
        }, {
          'name': 'Mac Client',
          'value': 176
        }, {
          'name': 'Mozilla',
          'value': 32
        }]
      };
      var deferred = $q.defer();
      $timeout(function() {
        deferred.resolve(res);
      }, 3000);
      return deferred.promise;
*/
    }

    function getQuerys(link, cluster, time) {
      if (cluster !== allClusters) {
        cluster = _.replace(cluster, /\W/g, '');
        cluster = cluster.toLowerCase();
      }
      if (cluster === allClusters) {
        return link + formRelativeTime(time);
      } else {
        return '/cluster/' + cluster + link + formRelativeTime(time);
      }
    }

    function formRelativeTime(time) {
      if (time.value === 0) {
        return '/?relativeTime=1d';
      } else if (time.value === 1) {
        return '/?relativeTime=7d';
      } else if (time.value === 2) {
        return '/?relativeTime=30d';
      } else {
        return '/?relativeTime=90d';
      }
    }

    return {
      getTotalMeetings: getTotalMeetings,
      getTotalMinutes: getTotalMinutes,
      getTotalParticipant: getTotalParticipant,
      getMeetingLocationData: getMeetingLocationData,
      getMeetingTypeData: getMeetingTypeData,
      getMeetingMetrics: getMeetingMetrics,
      getMeetingTypeDurationData: getMeetingTypeDurationData
    };
  }
})();
