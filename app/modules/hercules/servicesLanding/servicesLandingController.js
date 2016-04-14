(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('servicesLandingController', ServicesLandingController)
    .directive('servicesLandingPage', [
      function () {
        return {
          controller: 'servicesLandingController',
          templateUrl: 'modules/hercules/servicesLanding/servicesLanding.html'
        };
      }
    ]);

  /* @ngInject */
  function ServicesLandingController($scope, $log) {
    var vm = this;

    $scope.title = "Test";
    $scope.showLayout = "all";
    $scope.showDropdown = false;
    $scope.activeCards = {
      "Calendar": true,
      "Call": false,
      "Context": false,
      "Media": true
    };
    $scope.cards = [{
      "link": "services/expressway-management",
      "title": "Management",
      "icon": "icon-circle-calendar",
      "descr": "Management Service is the global configuration service for Calendar and Call Services.",
      "active": true
    }, {
      "link": "services/calendar",
      "title": "Calendar",
      "icon": "icon-circle-calendar",
      "descr": "(Integrate Microsoft Exchange) Collaborate instantly. Just add @webex to attach a WebEx to your invitation. Add @spark to create a Spark room.",
      "active": true
    }, {
      "link": "services/call",
      "title": "Call",
      "icon": "icon-circle-call",
      "descr": "Enables Zero-Touch Meetings, desktop sharing from Cisco Spark clients while on a work phone (Aware).  Place/answer work calls from Cisco Spark clients (Connect).",
      "active": false
    }, {
      "link": "services/expressway-management",
      "title": "Media",
      "icon": "icon-circle-call",
      "descr": "Lorem ipsum dolor sit amet, consectetur a the adipiscing elit. Donec placera ultricvenenatis. Aliquam mauris. Lorem ipsum dolor.",
      "active": false
    }, {
      "link": "services/expressway-management",
      "title": "Context",
      "icon": "icon-circle-data",
      "descr": "Set up the Media Service to host meetings in the Cloud and On-premise.",
      "active": true
    }];

    //vm.pageTitle = $translate.instant('overview.pageTitle');

    $scope.changeLayout = function (changeTo) {
      $scope.showLayout = changeTo;
    };

    $scope.changeDropdown = function () {
      $log.debug("change dropdown");
      $scope.showDropdown = !$scope.showDropdown;
    };

    $scope.getFilter = function (card) {
      var filter;
      if ($scope.showLayout == 'active' && card.active === true) {
        filter = true;
      } else if ($scope.showLayout == 'all') {
        filter = true;
      }
      return filter;
    };
  }
})();
