'use strict';
/* global $, Bloodhound, moment */

angular.module('Squared')
  .controller('SupportCtrl', ['$scope', '$q', '$location', '$filter', '$rootScope', 'Notification', 'Log', 'Config', 'Utils', 'Storage', 'Auth', 'Authinfo', 'UserListService', 'LogService', '$translate',
    function($scope, $q, $location, $filter, $rootScope, Notification, Log, Config, Utils, Storage, Auth, Authinfo, UserListService, LogService, $translate) {

      //Initialize
      Notification.init($scope);
      $scope.popup = Notification.popup;
      $('#logs-panel').hide();

      $('#logsearchfield').attr('placeholder', $filter('translate')('supportPage.inputPlaceholder'));

      //initialize sort icons
      var sortIcons = ['sortIconEmailAddress', 'sortIconDate', 'sortIconLocusId', 'sortIconCallStart'];
      for(var sortIcon in sortIcons) {
        if(sortIcons[sortIcon] === 'sortIconDate') {
          $scope[sortIcons[sortIcon]] = 'fa-sort-desc';
        } else {
          $scope[sortIcons[sortIcon]] = 'fa-sort';
        }
      }

      $scope.logsSortBy = 'date';
      $scope.reverseLogs = true;

      $scope.toggleSort = function(type, icon) {
        $scope.reverseLogs = !$scope.reverseLogs;
        changeSortIcon(type, icon);
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

      var validateLocusId = function(locusId) {
        var re = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/;
        return re.test(locusId);
      };

      var validateCallStartTime = function(callStart) {
        var re = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/;
        return re.test(callStart);
      };

      //Retrieving logs for user
      $scope.getLogs = function() {
        $('#logsearchfield').typeahead('close');
        $scope.userLogs = [];
        angular.element('#logSearchBtn').button('loading');
        //check whether email address or uuid was enetered
        var searchInput = $('#logsearchfield').val();
        if (searchInput) {
          searchLogs(searchInput);
        } else {
          Log.debug('Search input cannot be empty.');
          Notification.notify([$filter('translate')('supportPage.errEmptyinput')], 'error');
          angular.element('#logSearchBtn').button('reset');
        }
      };

      $scope.formatDate = function(date) {
        if (date !== ''){
          return moment.utc(date).local().format('MMM D \'YY H:mm ZZ');
        } else {
          return date;
        }
      };

      var searchLogs = function(searchInput) {
        LogService.searchLogs(searchInput, function(data, status) {
          if (data.success) {
            //parse the data
            $scope.userLogs = [];
            if (data.metadataList && data.metadataList.length > 0) {
              for (var index in data.metadataList) {
                var metadata = data.metadataList[index].meta;
                var locus = '';

                if (metadata && metadata.locusid) {
                  locus = metadata.locusid;
                }

                var fullFilename = data.metadataList[index].filename;
                var filename = fullFilename.substr(fullFilename.lastIndexOf('/') + 1);
                
                var callStartIndex = filename.indexOf('_') + 1;
                var callStartEndIndex = filename.indexOf('Z', callStartIndex) + 1;
                var callStartTime = filename.substring(callStartIndex, callStartEndIndex);

                if(!validateCallStartTime(callStartTime)) {
                  callStartTime = '-NA-';
                }

                if (locus === '') {
                  var lastIndex = filename.indexOf('_');
                  locus = filename.substr(0, lastIndex);
                }

                if(!validateLocusId(locus)) {
                  locus = '-NA-';
                }

                var log = {
                  fullFilename: fullFilename,
                  emailAddress: data.metadataList[index].emailAddress,
                  locusId: locus,
                  callStart: callStartTime,
                  date: data.metadataList[index].timestamp
                };
                $scope.userLogs.push(log);
                angular.element('#logSearchBtn').button('reset');
                $('#logs-panel').show();
              }
            } else {
              angular.element('#logSearchBtn').button('reset');
              $('#logs-panel').show();
            }
          } else {
            $('#logs-panel').show();
            angular.element('#logSearchBtn').button('reset');
            Log.debug('Failed to retrieve user logs. Status: ' + status);
            Notification.notify([$translate.instant('supportPage.errLogQuery', {
              status: status
            })], 'error');
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
