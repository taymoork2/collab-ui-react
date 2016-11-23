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
    var shriniURL = 'http://localhost:8080/cloud-apps-server-1.0-SNAPSHOT/athena/api/v1/organizations/27f564b5-37f4-4b2d-a896-622ebb973506';

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

    function getMeetingTypeData(time, cluster) {
      var url = shriniURL + getQuerys(meetingTypesLink, cluster, time);
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
      getMeetingTypeData: getMeetingTypeData,
      getMeetingMetrics: getMeetingMetrics,
      getMeetingTypeDurationData: getMeetingTypeDurationData
    };
  }
})();
