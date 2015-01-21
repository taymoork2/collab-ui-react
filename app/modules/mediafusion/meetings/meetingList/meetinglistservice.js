'use strict';

//Defining a MeetingListService.
angular.module('Core')
  .service('MeetingListService', ['$http', '$rootScope', 'Config', 'Authinfo', 'Log', 'Utils', 'Auth',
    function ($http, $rootScope, Config, Authinfo, Log, Utils, Auth) {

      //Fetching the Base url form config.js file.
      var meetingUrl = Config.getMeetingServiceUrl();
      var meetinglistservice = {

        //listMeetings will actually perfomr a rest call and fetches the data from the server and return back to controller.

        listMeetings: function (callback) {

          var listUrl = Utils.sprintf(meetingUrl + '/meeting/getallminmeeting', [Authinfo.getOrgId()]);
          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;

          //Actual rest call to get meeting info from server and also error case is handeled.
          $http.get(listUrl)
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
        }
      };

      return meetinglistservice;

    }
  ]);
