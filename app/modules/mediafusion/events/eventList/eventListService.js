'use strict';

//Defining a utilizationService.
angular.module('Mediafusion')
  .service('EventListService', ['$http', '$rootScope', 'Config', 'Authinfo', 'Log', 'Utils', 'Auth', 'UrlConfig',
    function ($http, $rootScope, Config, Authinfo, Log, Utils, Auth, UrlConfig) {
      // console.log("EventListService");
      //Fetching the Base url form config.js file.
      var searchfilter = 'filter=%s';
      var baseUrl = UrlConfig.getAlarmServiceUrl();

      var eventListService = {

        queryEventList: function (pgNo, searchString, callback) {
          //console.log("In queryEventList");
          var eventListUrl = Utils.sprintf(baseUrl + '/allEvents', [Authinfo.getOrgId()]);
          var eventSearchUrl = null;
          var encodedSearchStr = '';
          var queryParams = '&pgNo=' + pgNo + '&pgSize=' + Config.eventsPerPage;

          if (searchString !== '' && typeof (searchString) !== 'undefined') {
            eventSearchUrl = eventListUrl + '?' + searchfilter + "&" + queryParams;
            encodedSearchStr = window.encodeURIComponent(searchString);
            eventListUrl = Utils.sprintf(eventSearchUrl, [encodedSearchStr]);
          } else {
            eventListUrl = eventListUrl + '?' + queryParams;
          }

          //console.log("Event List URL::"+eventListUrl);
          //var data ={};

          //data.success = true;
          //callback(data, true);
          //Actual rest call to get event info from server and also error case is handeled.
          $http.get(eventListUrl)
            .success(function (data, status) {
              data = data || {};
              //console.log("Returned data is"+data);
              data.events = data;
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

      return eventListService;

    }
  ]);
