(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .service('MeetingsReportService', MeetingsReportService);
  /* @ngInject */
  function MeetingsReportService($http, Authinfo, UrlConfig) {
    var urlBase = UrlConfig.getAthenaServiceUrl() + '/organizations/' + Authinfo.getOrgId();
    var meetingMetricsLink = '/meeting_metrics';
    var meetingTypesLink = '/meeting_types_count';
    var meetingTypesDurationLink = '/meeting_types_duration';

    function extractDataFromResponse(res) {
      return _.get(res, 'data');
    }

    function getMeetingTypeDurationData(time) {
      var url = urlBase + getQuerys(meetingTypesDurationLink, time);

      return $http.get(url).then(extractDataFromResponse);
    }

    function getMeetingMetrics(time) {
      var url = urlBase + getQuerys(meetingMetricsLink, time);

      return $http.get(url).then(extractDataFromResponse);
    }

    function getMeetingTypeData(time) {
      var url = urlBase + getQuerys(meetingTypesLink, time);
      return $http.get(url).then(extractDataFromResponse);
    }

    function getQuerys(link, time) {
      return link + formRelativeTime(time);
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
