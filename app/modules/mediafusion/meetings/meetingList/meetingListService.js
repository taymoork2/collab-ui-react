'use strict';

//Defining a MeetingListService.
angular.module('Mediafusion')
  .service('MeetingListService', ['$http', '$rootScope', 'Config', 'Authinfo', 'Log', 'Utils', 'Auth', 'UrlConfig',
    function ($http, $rootScope, Config, Authinfo, Log, Utils, Auth, UrlConfig) {

      //Fetching the Base url form config.js file.
      var searchfilter = 'filter=%s';
      var baseUrl = UrlConfig.getMeetingServiceUrl();
      var meetinginfoUrl = UrlConfig.getMeetingInfoServiceUrl();

      var meetinglistservice = {

        //listMeetings will actually perform a rest call and fetches the data from the server and return back to controller.

        listMeetings: function (startTimeStamp, endTimeStamp, pgNo, searchString, callback) {

          var meetingListUrl = Utils.sprintf(baseUrl + '/meeting/getAllMinMeeting', [Authinfo.getOrgId()]);
          var meetingSearchUrl = null;
          var encodedSearchStr = '';
          var queryParams = "startTimeStamp=" + startTimeStamp + "&endTimeStamp=" + endTimeStamp + '&pgNo=' + pgNo + '&pgSize=' + Config.meetingsPerPage;

          if (searchString !== '' && typeof (searchString) !== 'undefined') {
            meetingSearchUrl = meetingListUrl + '?' + searchfilter + "&" + queryParams;
            encodedSearchStr = window.encodeURIComponent(searchString);
            meetingListUrl = Utils.sprintf(meetingSearchUrl, [encodedSearchStr]);
          } else {
            meetingListUrl = meetingListUrl + '?' + queryParams;
          }

          //Actual rest call to get meeting info from server and also error case is handeled.
          $http.get(meetingListUrl)
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              data.status = status;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
            });
        },

        listMeetingsinfo: function (startDateTime, callback) {
          var meetinginfolistUrl = Utils.sprintf(meetinginfoUrl + '/meeting/getAddnInfo?id=' + $rootScope.meetingid, [Authinfo.getOrgId()]);
          meetinginfolistUrl = meetinginfolistUrl + "&startDateTime=" + startDateTime;

          //Actual rest call to get additional meeting info from server and also error case is handeled.
          $http.get(meetinginfolistUrl)
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              data.status = status;
              callback(data, status, $rootScope.meetingid);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status, $rootScope.meetingid);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
            });

        },
        listParticipantinfo: function (callback) {
          var participantlistUrl = Utils.sprintf(meetinginfoUrl + '/participant/getPartInfo?id=' + $rootScope.meetingid, [Authinfo.getOrgId()]);

          //Actual rest call to get participant info from server and also error case is handeled.
          $http.get(participantlistUrl)
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              data.status = status;
              callback(data, status, $rootScope.meetingid);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status, $rootScope.meetingid);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
            });
        },

        /**
         * Fetching the Number of Enterprise and Cloud meetings chart data .
         *
         */
        meetingChartInfo: function (numberOfDays, durationType, latestDate, callback) {
          var meetingChartUrl = Utils.sprintf(baseUrl + '/meeting/meetingGraphData', [Authinfo.getOrgId()]);
          var queryParams = "day=" + numberOfDays + "&type=" + durationType + "&latestdate=" + latestDate;
          meetingChartUrl = meetingChartUrl + '?' + queryParams;

          //Actual rest call to get meeting chart info from server and also error case is handeled.
          $http.get(meetingChartUrl)
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              data.status = status;
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
            });
        }

      };

      return meetinglistservice;

    }
  ]);
