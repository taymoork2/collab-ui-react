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
    var meetingTypesLink = '/meeting_types_count';
    var meetingTypesDurationLink = '/meeting_types_duration';
    function extractDataFromResponse(res) {
      return _.get(res, 'data');
    }

    function getMeetingTypeDurationData(time, cluster) {
      var url = urlBase + getQuerys(meetingTypesDurationLink, cluster, time);

      return $http.get(url).then(extractDataFromResponse);
    }

    function getMeetingMetrics(time, cluster) {
      var url = urlBase + getQuerys(meetingMetricsLink, cluster, time);

      return $http.get(url).then(extractDataFromResponse);
    }

    function getMeetingTypeData(time, cluster) {
      var url = urlBase + getQuerys(meetingTypesLink, cluster, time);
      return $http.get(url).then(extractDataFromResponse);
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
      getMeetingMetrics: getMeetingMetrics,
      getMeetingTypeData: getMeetingTypeData,
      getMeetingTypeDurationData: getMeetingTypeDurationData
    };
  }
})();
