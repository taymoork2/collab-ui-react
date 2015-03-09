'use strict';

angular.module('Core')
  .controller('PartnerProfileCtrl', ['$scope', 'Authinfo', 'Notification', '$stateParams', 'UserListService',
    function ($scope, Authinfo, Notification, $stateParams, UserListService) {

      // toggles api calls, show/hides divs based on customer or partner profile
      $scope.isPartner = $stateParams.isPartner === 'true' ? true : false;

      // hold partner admin object
      $scope.partner = null;

      // radio button values
      $scope.problemSiteInfo = {
        partner: 0,
        yours: 1
      };

      $scope.helpSiteInfo = {
        partner: 0,
        yours: 1
      };

      // strings to be translated as placeholders, need to be used as values
      $scope.grant = 'Grant support access to Cisco\'s Customer Success team.';
      $scope.troubleUrl = 'Your trouble reporting site URL';
      $scope.troubleText = 'Provide optional text to give people an idea of where the URL will take them and what they can expect to do there.';
      $scope.helpUrlText = 'Your help site URL';
      $scope.partnerProvidedText = 'Text provided by the partner.';

      // ci api calls will go in here
      $scope.init = function () {
        $scope.rep = {
          name: 'Kevin Perlas',
          phone: '555-444-555',
          email: 'kperlas@cisco.com'
        };

        $scope.companyName = Authinfo.getOrgName();

        $scope.problemSiteRadioValue = 0;
        $scope.helpSiteRadioValue = 0;

        $scope.supportUrl = '';
        $scope.supportText = '';
        $scope.helpUrl = '';

        if (!$scope.isPartner) {
          UserListService.listPartners(Authinfo.getOrgId(), function (data) {
            $scope.partner = data.partners[0];
          });
        }

        /* UNCOMMENT ONCE CISCO IS A PARTNER */
        // UserListService.getCiscoRep(function(data, status){
        //   if(data.success){
        //     console.log('success');
        //     console.log(data);
        //   } else{
        //     console.log('error');
        //     console.log(data);
        //   }
        // });
      };

      $scope.init();

      // validates support url as valid url & checks for %%logID%% where logID is any alphanumeric value
      $scope.validation = function () {
        var validUrlRegex = new RegExp('http[s]?:\\/\\/(?:www\\.|(?!www))[^\\s\\.]+\\.[^\\s]{2,}|www\\.[^\\s]+\\.[^\\s]{2,}');
        var logIdRegex = new RegExp('\\?id=%%[a-zA-Z0-9]+%%');
        if ($scope.problemSiteRadioValue === 1) {
          if ($scope.supportUrl.match(validUrlRegex) && $scope.supportUrl.match(logIdRegex)) {
            Notification.notify(['You have successfully set your support URL.'], 'success');
          } else {
            Notification.notify(['Please make sure that the url is formatted correctly. Example: http://www.acme.com/reportproblem?id=%%logID%%'], 'error');
          }
        }
      };

      $scope.setProblemRadio = function (value) {
        $scope.problemSiteRadioValue = value;
      };

      $scope.setHelpRadio = function (value) {
        $scope.helpSiteRadioValue = value;
      };
    }
  ]);
