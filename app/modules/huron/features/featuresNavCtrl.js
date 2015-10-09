(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .controller('HuronFeaturesNavCtrl', HuronFeaturesNavCtrl);

  /* jshint validthis: true */

  /* @ngInject */
  function HuronFeaturesNavCtrl($scope, $state, $translate, $filter, $timeout, $modal, Authinfo, HuntGroupService, Log, Notification) {

    var vm = this;
    vm.filters = [];
    vm.filterText = '';
    vm.placeholder = {};
    vm.searchData = searchData;
    vm.setFilter = setFilter;
    vm.listOfFeatures = [];
    vm.openModal = openModal;
    vm.pageState = 'Loading';
    var listOfAllFeatures = [];
    var listOfHuntGroups = [];
    var listOfAutoAttendants = [];
    var listOfCallParks = [];
    var huntGroupToBeDeleted = {};
    vm.placeholder = {
      'name': 'Search'
    };

    /* This common format is used to layout cards for AA, HG, CP */
    var commonDataFormatForCards = {
      'cardName': '',
      'numbers': [],
      'featureName': '',
      'filterValue': ''
    };
    /* Adding Auto Attendant and Call Park filters to validate HuntGroup filter */
    /* Please change Auto Attendant and HuntGroup filters accordingly if needed*/
    vm.filters = [{
      name: 'All',
      filterValue: 'all'
    }, {
      name: 'Auto Attendant',
      filterValue: 'AA'
    }, {
      name: 'Hunt Group',
      filterValue: 'HG'
    }, {
      name: 'Call Park',
      filterValue: 'CP'
    }];

    vm.cardColors = {
      'AA': 'primary',
      'HG': 'eggplant',
      'CP': 'alerts'
    };

    //Switches Data that populates the Features tab
    function setFilter(filterValue) {
      if (filterValue === 'all') {
        vm.listOfFeatures = $filter('filter')(listOfAllFeatures, {
          $: vm.filterText
        });
      } else if (filterValue === 'HG') {
        vm.listOfFeatures = $filter('filter')(listOfAllFeatures, {
          $: vm.filterText,
          filterValue: 'HG'
        });
      } else if (filterValue === 'CP') {
        vm.listOfFeatures = $filter('filter')(listOfAllFeatures, {
          $: vm.filterText,
          filterValue: 'CP'
        });
      } else if (filterValue === 'AA') {
        vm.listOfFeatures = $filter('filter')(listOfAllFeatures, {
          $: vm.filterText,
          filterValue: 'AA'
        });
      }
    }

    /* This function does an in-page search for the string typed in search box*/
    function searchData(searchStr) {
      vm.filterText = searchStr;
      vm.listOfFeatures = $filter('filter')(listOfAllFeatures, {
        $: vm.filterText
      });
    }

    /* Get list of auto attendants*/
    /* This is a dummy implementation to list AutoAttendants*/
    var getListOfAutoAttendants = function () {

      /* Get list of Auto Attendandts code may go here
       If Get List of AA back end call is successful, just stub out the listOfAutoAttendants array
       and concatenate listOfAutoAttendants with listOfFeatures
       */

      /*
        Set vm.pageState to 'showFeatures' if any AA's are received
       */

      vm.listOfFeatures = vm.listOfFeatures.concat(listOfAutoAttendants);

      /* this is done -
       1. to have to a local copy of the data to do in page search
       2. to display data based on filter selected
       */
      listOfAllFeatures = listOfAllFeatures.concat(listOfAutoAttendants);
    };

    /* Get list of HuntGroups*/
    var getListOfHuntGroups = function () {

      var customerId = Authinfo.getOrgId();
      HuntGroupService.getListOfHuntGroups(customerId).then(function (response) {

        var huntGroupData = response.data;
        if (huntGroupData.items.length > 0) {
          vm.pageState = 'showFeatures';
          angular.forEach(huntGroupData.items, function (huntGroup) {
            commonDataFormatForCards.cardName = huntGroup.name;
            commonDataFormatForCards.numbers = huntGroup.numbers;
            commonDataFormatForCards.membersCount = huntGroup.memberCount;
            commonDataFormatForCards.huntGroupId = huntGroup.uuid;
            commonDataFormatForCards.featureName = 'huronFeatureDetails.hg';
            commonDataFormatForCards.filterValue = 'HG';
            listOfHuntGroups.push(commonDataFormatForCards);
            commonDataFormatForCards = {};
          });
        }

        vm.listOfFeatures = vm.listOfFeatures.concat(listOfHuntGroups);
        listOfAllFeatures = listOfAllFeatures.concat(listOfHuntGroups);

      }, function (response) {
        Log.warn('Could fetch huntGroups for customer with Id:', customerId);
        //Notify the user that retrieval of hunt groups list has been failed
        Notification.error('huntGroupDetails.failedToLoadHuntGroups');
      });
    };

    /* Get list of CallParks*/
    /* This is a Dummy implementation of this function*/
    var getListOfCallParks = function () {

      /*
        1. Get list of CallParks code may go here
        2. If Get List of call parks back-end call is successful just stub out the listOfCallParks array
           and concatenate listOfCallParks with listOfFeatures
        3. Set vm.pageState to 'showFeatures' when any CP's are received by controller
       */

      vm.listOfFeatures = vm.listOfFeatures.concat(listOfCallParks);

      /* this is done -
       1. to have to a local copy of the data to do in page search
       2. to display data based on filter selected
       */
      listOfAllFeatures = listOfAllFeatures.concat(listOfCallParks);
    };

    //Commenting out the code in this function to keep jshint happy
    vm.editHuronFeature = function (feature) {
      //if (feature.filterValue === 'AA') {
      //  //Call  AutoAttendant Edit Controller
      //} else if (feature.filterValue === 'HG') {
      //  //Call Edit HuntGroup Controller
      //  //HuntGroup Edit Page will be done in US213495
      //} else if (feature.filterValue === 'CP') {
      //  //Call CallPark Edit Controller
      //}
    };

    vm.deleteHuronFeature = function (feature) {
      if (feature.filterValue === 'HG') {
        huntGroupToBeDeleted = feature;
        $state.go('huronfeatures.deleteHuntGroup', {
          deleteHuntGroupName: feature.cardName,
          deleteHuntGroupId: feature.huntGroupId
        });
      }
      //else if (feature.filterValue === 'AA') {
      //  //goto Delete AutoAttendant Controller
      //
      //} else if (feature.filterValue === 'CP') {
      //  //goto Delete CallPark Controller
      //}
    };

    var isFeatureListEmpty = function () {
      if (vm.listOfFeatures.length === 0) {
        vm.pageState = 'NewFeature';
      }
    };

    //list is updated by deleting a hunt group
    $scope.$on('HUNT_GROUP_DELETED', function () {
      vm.listOfFeatures.splice(vm.listOfFeatures.indexOf(huntGroupToBeDeleted), 1);
      listOfAllFeatures.splice(listOfAllFeatures.indexOf(huntGroupToBeDeleted), 1);
      huntGroupToBeDeleted = {};
      if (listOfAllFeatures.length === 0 && vm.listOfFeatures.length === 0) {
        vm.pageState = "NewFeature";
      }
      if (vm.filterText) {
        searchData(vm.filterText);
      }
    });

    function openModal() {
      var modalInstance = $modal.open({
        templateUrl: 'modules/huron/features/newFeature/newFeatureModal.tpl.html',
        controller: 'NewFeatureModalCtrl',
        controllerAs: 'newFeatureModalCtrl'
      });

      /* Goto the corresponding Set up Assistant controller
      based on the feature selected */
      modalInstance.result.then(function (selectedFeature) {
        vm.feature = selectedFeature;
      }, function () {
        vm.feature = '';
      });
    }

    function init() {
      getListOfAutoAttendants();
      getListOfHuntGroups();
      getListOfCallParks();
      $timeout(isFeatureListEmpty, 1000);
    }
    init();
  }
})();
