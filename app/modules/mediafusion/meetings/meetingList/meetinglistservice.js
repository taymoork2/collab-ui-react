'use strict';

//Defining a MeetingListService.
angular.module('Core')
  .service('MeetingListService', ['$http', '$rootScope', 'Config', 'Authinfo', 'Log', 'Utils', 'Auth',
    function ($http, $rootScope, Config, Authinfo, Log, Utils, Auth) {

      //Fetching the Base url form config.js file.
      var searchfilter = 'filter=%s';
      var baseUrl = Config.getMeetingServiceUrl();
      var meetinginfoUrl = Config.getMeetinginfoserviceUrl();

      var meetinglistservice = {

        //listMeetings will actually perform a rest call and fetches the data from the server and return back to controller.

        listMeetings: function (startTimeStamp, endTimeStamp, pgNo, pgSize, searchString, callback) {
          //listMeetings: function (callback) {

          var meetingListUrl = Utils.sprintf(baseUrl + '/meeting/getallminmeeting', [Authinfo.getOrgId()]);
          //var searchString;
          var meetingSearchUrl = null;
          var encodedSearchStr = '';

          if (searchString !== '' && typeof (searchString) !== 'undefined') {
            meetingSearchUrl = meetingListUrl + '?' + searchfilter;
            encodedSearchStr = window.encodeURIComponent(searchString);
            meetingListUrl = Utils.sprintf(meetingSearchUrl, [encodedSearchStr]);
            //searchString = $rootScope.searchString;
          } else {
            meetingSearchUrl = meetingListUrl + '?' + searchfilter + '';
            meetingListUrl = Utils.sprintf(meetingSearchUrl, [encodedSearchStr]);
            //searchString = $rootScope.searchString;
          }

          if (startTimeStamp !== '' && typeof (startTimeStamp) !== 'undefined') {
            meetingListUrl = meetingListUrl + '&startTimeStamp=' + startTimeStamp;
          }

          if (endTimeStamp !== '' && typeof (endTimeStamp) !== 'undefined') {
            meetingListUrl = meetingListUrl + '&endTimeStamp=' + endTimeStamp;
          }

          if (pgNo && pgNo > 0) {
            meetingListUrl = meetingListUrl + '&pgNo=' + pgNo;
          }

          if (pgSize && pgSize > 0) {
            meetingListUrl = meetingListUrl + '&pgSize=' + pgSize;
          }

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          //Actual rest call to get meeting info from server and also error case is handeled.
          $http.get(meetingListUrl)
            .success(function (data, status) {
              data.success = true;
              data.status = status;
              callback(data, status, searchString);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status, searchString);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
              Auth.handleStatus(status, description);
            });
        },

        /**
         * Fetching the Number of Enterprise and Cloud meetings and its respective participants.
         *
         */
        getMeetingsAndParticipants: function (callback) {

          var entAndCloudMeetingsUrl = Utils.sprintf(baseUrl + '/meeting/getEnterpriseAndCloudMeetings', [Authinfo.getOrgId()]);
          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          //Actual rest call to get meeting info from server and also error case is handeled.
          $http.get(entAndCloudMeetingsUrl)
            .success(function (data, status) {
              data.success = true;
              data.status = status;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
              Auth.handleStatus(status, description);
            });
        },

        listMeetingsinfo: function (callback) {
          var meetinginfolistUrl = Utils.sprintf(meetinginfoUrl + '/meeting/getaddninfo?id=' + $rootScope.meetingid, [Authinfo.getOrgId()]);
          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          //Actual rest call to get additional meeting info from server and also error case is handeled.
          $http.get(meetinginfolistUrl)
            .success(function (data, status) {
              data.success = true;
              data.status = status;
              callback(data, status, $rootScope.meetingid);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status, $rootScope.meetingid);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
              Auth.handleStatus(status, description);
            });

        },
        listParticipantinfo: function (callback) {
          var participantlistUrl = Utils.sprintf(meetinginfoUrl + '/participant/getpartinfo?id=' + $rootScope.meetingid, [Authinfo.getOrgId()]);
          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          //Actual rest call to get participant info from server and also error case is handeled.
          $http.get(participantlistUrl)
            .success(function (data, status) {
              data.success = true;
              data.status = status;
              callback(data, status, $rootScope.meetingid);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status, $rootScope.meetingid);
              var description = null;
              var errors = data.Errors;
              if (errors) {
                description = errors[0].description;
              }
              Auth.handleStatus(status, description);
            });
        }
      };

      return meetinglistservice;

    }
  ]);
