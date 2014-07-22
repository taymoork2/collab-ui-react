'use strict';
/* global $, Bloodhound, moment */

angular.module('wx2AdminWebClientApp')
  .controller('SupportCtrl', ['$scope', '$q', '$location', '$filter', '$rootScope', 'Notification', 'Log', 'Config', 'Utils', 'Storage', 'Auth', 'Authinfo', 'UserListService', 'LogService', '$translate',
    function($scope, $q, $location, $filter, $rootScope, Notification, Log, Config, Utils, Storage, Auth, Authinfo, UserListService, LogService, $translate) {

      //Initialize
      Notification.init($scope);
      $scope.popup = Notification.popup;
      $('#logs-panel').hide();

      $('#logsearchfield').attr('placeholder', $filter('translate')('supportPage.inputPlaceholder'));

      //initialize sort icons
      var sortIcons = ['sortIconEmailAddress', 'sortIconDate', 'sortIconName', 'sortIconLocusId', 'sortIconCallStart', 'sortIconPlatform', 'sortIconUserId'];
      for(var sortIcon in sortIcons) {
        if(sortIcons[sortIcon] === 'sortIconDate') {
          $scope[sortIcons[sortIcon]] = 'fa-sort-desc';
        } else {
          $scope[sortIcons[sortIcon]] = 'fa-sort';
        }
      }

      $scope.sortIconDate = 'fa-sort-desc';
      $scope.sortIconName =  'fa-sort';

      $scope.logsSortBy = 'date';
      $scope.reverseLogs = true;

      $scope.toggleSort = function(type) {
        $scope.reverseLogs = !$scope.reverseLogs;
        switch(type) {

        case 'emailAddress':
          changeSortIcon('emailAddress', 'sortIconEmailAddress');
          break;

        case 'name':
          changeSortIcon('name', 'sortIconName');
          break;

        case 'date':
          changeSortIcon('date', 'sortIconDate');
          break;

        case 'locusId':
          changeSortIcon('locusId', 'sortIconLocusId');
          break;

        case 'callStart':
          changeSortIcon('callStart', 'sortIconCallStart');
          break;

        case 'platform':
          changeSortIcon('platform', 'sortIconPlatform');
          break;

        case 'userId':
          changeSortIcon('userId', 'sortIconUserId');
          break;

        default:
          Log.debug('Sort type not recognized.');
        }
      };

      var changeSortIcon = function(logsSortBy, sortIcon) {
        $scope.logsSortBy = logsSortBy;
        if ($scope.reverseLogs === true) {
          $scope[sortIcon] = 'fa-sort-desc';
        } else {
          $scope[sortIcon] = 'fa-sort-asc';
        }

        for(var otherIcon in sortIcons) {
          if(sortIcons[otherIcon] !== sortIcon) {
            $scope[sortIcons[otherIcon]] = 'fa-sort';
          }
        }
      };

      var initializeTypeahead = function() {
        var scimSearchUrl = Config.scimUrl + '?count=10&attributes=name,userName&filter=userName%20sw%20%22';
        var suggestUsersUrl = Utils.sprintf(scimSearchUrl, [Authinfo.getOrgId()]);
        var engine = new Bloodhound({
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace('userName'),
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          limit: 5,
          remote: {
            url: suggestUsersUrl,
            filter: function(data) {
              return data.Resources;
            },
            replace: function(url, query) {
              return url + encodeURIComponent(query) + '%22'; //%22 is encoded double-quote
            },
            cache: true,
            ajax: {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            }
          }
        });

        engine.initialize();

        $('#logsearchfield').typeahead({
          hint: true,
          highlight: true,
          minLength: 2
        }, {
          name: 'email',
          displayKey: 'userName',
          source: engine.ttAdapter()
        });
      };
      //Populating authinfo data if empty.
      var token = Storage.get('accessToken');
      if (Auth.isAuthorized($scope)) {
        Log.debug('Authinfo data is loaded.');
        initializeTypeahead();
      }

      $scope.$on('AuthinfoUpdated', function() {
        //Initializing typeahead engine when authinfo is ready
        initializeTypeahead();
      });

      var getUserId = function(searchinput) {
        var deferred = $q.defer();
        UserListService.getUser(searchinput, function(data, status) {
          if (data.success) {
            Log.debug('Returned data for: ' + searchinput, data.Resources);
            if (data.Resources.length > 0) {
              deferred.resolve(data.Resources[0].id);
              $scope.userName = data.Resources[0].userName;
            } else {
              $('#logs-panel').show();
              Log.debug('Could not find user: ' + searchinput);
              angular.element('#logSearchBtn').button('reset');
              Notification.notify([$translate.instant('supportPage.errUsernotfound', {
                input: searchinput
              })], 'error');
            }
          } else {
            $('#logs-panel').show();
            Log.debug('Query existing users failed. Status: ' + status);
            deferred.reject('Querying user failed. Status: ' + status);
          }
        });
        return deferred.promise;
      };

      var validateEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      };

      var validateUuid = function(uuid) {
        var re = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/;
        return re.test(uuid);
      };

      //Retrieving logs for user
      $scope.getLogs = function() {
        $('#logsearchfield').typeahead('close');
        $scope.userLogs = [];
        angular.element('#logSearchBtn').button('loading');
        //check whether email address or uuid was enetered
        var searchinput = $('#logsearchfield').val();
        if (typeof searchinput === 'undefined' || searchinput === '') {
          Log.debug('Search input cannot be empty.');
          Notification.notify([$filter('translate')('supportPage.errEmptyinput')], 'error');
          angular.element('#logSearchBtn').button('reset');
        } else if (validateEmail(searchinput)) {
          getUserId(searchinput).then(function(userid) {
            fetchLogsForUser(userid);
          }, function(error) {
            angular.element('#logSearchBtn').button('reset');
            Notification.notify([error], 'error');
          });
        } else if (validateUuid(searchinput)) {
          fetchLogsForUser(searchinput);
        } else {
          Log.debug('Invalid input: ' + searchinput);
          angular.element('#logSearchBtn').button('reset');
          var error = [$translate.instant('supportPage.errInvalidInput', {
            input: searchinput
          })];
          Notification.notify(error, 'error');
        }
      };

      $scope.formatDate = function(date) {
        if (date !== ''){
          return moment.utc(date).local().format('MMM D, YYYY h:mm A ZZ');
        } else {
          return date;
        }
      };

      var fetchLogsForUser = function(userid) {
        LogService.listLogs(userid, function(data, status) {
          if (data.success) {
            //parse the data
            $scope.userLogs = [];
            if (data.logDetails.length > 0) {
              for (var index in data.logDetails) {
                var log = {
                  name: data.logDetails[index].name,
                  filename: data.logDetails[index].filename,
                  orgId: data.logDetails[index].orgId,
                  userId: data.logDetails[index].userId,
                  locusId: data.logDetails[index].locusId,
                  platform: data.logDetails[index].platform,
                  date: data.logDetails[index].lastModified,
                  callStartTime: data.logDetails[index].callStartTime,
                  feedbackId: data.logDetails[index].feedbackId,
                  emailAddress: data.logDetails[index].emailAddress
                };
                $scope.userLogs.push(log);
                angular.element('#logSearchBtn').button('reset');
                $('#logs-panel').show();
              }
            } else {
              $('#logs-panel').show();
              angular.element('#logSearchBtn').button('reset');
            }
          } else {
            $('#logs-panel').show();
            angular.element('#logSearchBtn').button('reset');
            Log.debug('Failed to retrieve user logs. Status: ' + status);
            if (status === 403) {
              Notification.notify([$translate.instant('supportPage.errUnauthorizedUserAccess', {
                input: userid
              })], 'error');
            } else if (status === 404) {
              Notification.notify([$translate.instant('supportPage.errUserdoesnotexist', {
                input: userid
              })], 'error');
            } else {
              Notification.notify([$translate.instant('supportPage.errLogQuery', {
                status: status
              })], 'error');
            }
          }
        });
      };

      $scope.downloadLog = function(filename) {
        LogService.downloadLog(filename, function(data, status) {
          if (data.success) {
            window.location.assign(data.tempURL);
          } else {
            Log.debug('Failed to download log: ' + filename + '. Status: ' + status);
            Notification.notify(['Failed to download log: ' + filename + '. Status: ' + status], 'error');
          }
        });
      };
    }
  ]);
