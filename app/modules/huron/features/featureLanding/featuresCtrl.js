(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('HuronFeaturesCtrl', HuronFeaturesCtrl);

  /* jshint validthis: true */

  /* @ngInject */
  function HuronFeaturesCtrl($scope, $state, $filter, $timeout, $modal, $q, Authinfo, HuronFeaturesListService, HuntGroupService, AutoAttendantCeInfoModelService, AAModelService, Notification, Log) {

    var vm = this;
    vm.filters = [];
    vm.filterText = '';
    vm.placeholder = {};
    vm.searchData = searchData;
    vm.setFilter = setFilter;
    vm.listOfFeatures = [];
    vm.aaModel = {};
    vm.openModal = openModal;
    vm.reload = reload;
    vm.pageState = 'Loading';
    vm.placeholder = {
      'name': 'Search'
    };
    vm.filters = [{
        name: 'All',
        filterValue: 'all'
      }, {
        name: 'Auto Attendant',
        filterValue: 'AA'
      }, {
        name: 'Hunt Group',
        filterValue: 'HG'
      }
      //  {
      //  name: 'Call Park',
      //  filterValue: 'CP'
      //}
    ];
    vm.cardColors = {
      'AA': 'primary',
      'HG': 'alerts'
        //'CP': 'alerts'
    };
    var listOfAllFeatures = [];
    var listOfHuntGroups = [];
    var listOfAutoAttendants = [];
    var featureToBeDeleted = {};
    var areFeaturesEmpty = {
      'aa': false,
      'hg': false
    };

    init();

    function init() {

      var aaPromise = getListOfAutoAttendants();
      var hgPromise = getListOfHuntGroups();

      handleAAPromise(aaPromise);
      handleHGPromise(hgPromise);

      $q.all([aaPromise, hgPromise]).then(function (responses) {
        isFeatureListEmpty();
      });
    }

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
        //} else if (filterValue === 'CP') {
        //  vm.listOfFeatures = $filter('filter')(listOfAllFeatures, {
        //    $: vm.filterText,
        //    filterValue: 'CP'
        //  });
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

    function reload() {
      init();
    }

    function getListOfAutoAttendants() {
      return AutoAttendantCeInfoModelService.getCeInfosList();
    }

    function getListOfHuntGroups() {
      var customerId = Authinfo.getOrgId();
      return HuntGroupService.getListOfHuntGroups(customerId);
    }

    function handleAAPromise(aaPromise) {
      aaPromise.then(function (data) {
        handleAutoAttendants(data);
      }, function (response) {
        handleFailures(response, 'huronFeatureDetails.aaName', 'aa');
      });
    }

    function handleHGPromise(hgPromise) {
      hgPromise.then(function (data) {
        handleHuntGroups(data.items);
      }, function (response) {
        handleFailures(response, 'huronFeatureDetails.hgName', 'hg');
      });
    }

    function handleFailures(response, featureName, featureCode) {
      Log.warn('Could fetch features for customer with Id:', Authinfo.getOrgId());
      if (featureCode === 'aa') {
        areFeaturesEmpty.aa = true;
      } else if (featureCode === 'hg') {
        areFeaturesEmpty.hg = true;
      }
      Notification.errorResponse(response, 'huronFeatureDetails.failedToLoad', {
        featureType: $filter('translate')(featureName)
      });
      showRetryPageIfNeeded();
    }

    function handleAutoAttendants(data) {
      vm.aaModel = AAModelService.newAAModel();
      vm.aaModel = data;
      listOfAutoAttendants = HuronFeaturesListService.autoAttendants(vm.aaModel.ceInfos);
      if (listOfAutoAttendants.length > 0) {
        AAModelService.setAAModel(vm.aaModel);
        vm.pageState = 'showFeatures';
        areFeaturesEmpty.aa = false;
        vm.listOfFeatures = vm.listOfFeatures.concat(listOfAutoAttendants);
        listOfAllFeatures = listOfAllFeatures.concat(listOfAutoAttendants);
      } else if (listOfAutoAttendants.length === 0) {
        areFeaturesEmpty.aa = true;
      }
    }

    function handleHuntGroups(data) {
      if (data.length > 0) {
        areFeaturesEmpty.hg = false;
        vm.pageState = 'showFeatures';
        areFeaturesEmpty.hg = false;
        listOfHuntGroups = HuronFeaturesListService.huntGroups(data);
        vm.listOfFeatures = vm.listOfFeatures.concat(listOfHuntGroups);
        listOfAllFeatures = listOfAllFeatures.concat(listOfHuntGroups);
      } else if (data.length === 0) {
        areFeaturesEmpty.hg = true;
      }
    }

    vm.editHuronFeature = function (feature) {
      if (feature.filterValue === 'AA') {
        vm.aaModel.aaName = feature.cardName;
        $state.go('huronfeatures.aabuilder', {
          aaName: vm.aaModel.aaName
        });
      } else if (feature.filterValue === 'HG') {
        HuntGroupService.editFeature(feature);
        $state.go('huntgroupedit');
      } // else if (feature.filterValue === 'CP') {
      //  //Call CallPark Edit Controller
      //}
    };

    vm.deleteHuronFeature = function (feature) {
      if (feature.filterValue === 'HG') {
        featureToBeDeleted = feature;
        $state.go('huronfeatures.deleteHuntGroup', {
          deleteHuntGroupName: feature.cardName,
          deleteHuntGroupId: feature.huntGroupId
        });
      } else if (feature.filterValue === 'AA') {
        featureToBeDeleted = feature;
        $state.go('huronfeatures.deleteFeature', {
          deleteFeatureName: feature.cardName,
          deleteFeatureId: feature.id,
          deleteFeatureType: feature.filterValue
        });
      }
      // else if (feature.filterValue === 'CP') {
      //  //goto Delete CallPark Controller
      //}
    };

    function isFeatureListEmpty() {
      if (vm.pageState !== 'showFeatures' && areFeaturesEmpty.aa && areFeaturesEmpty.hg && vm.listOfFeatures.length === 0) {
        vm.pageState = 'NewFeature';
      }
    }

    function showRetryPageIfNeeded() {
      if (vm.pageState === 'Loading' && areFeaturesEmpty.aa && areFeaturesEmpty.hg && vm.listOfFeatures.length === 0) {
        vm.pageState = 'Retry';
      }
    }

    //list is updated by deleting a hunt group
    $scope.$on('HUNT_GROUP_DELETED', function () {
      vm.listOfFeatures.splice(vm.listOfFeatures.indexOf(featureToBeDeleted), 1);
      listOfAllFeatures.splice(listOfAllFeatures.indexOf(featureToBeDeleted), 1);
      featureToBeDeleted = {};
      if (listOfAllFeatures.length === 0) {
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

  }
})();
