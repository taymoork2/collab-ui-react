(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('HuronFeaturesCtrl', HuronFeaturesCtrl);

  /* jshint validthis: true */

  /* @ngInject */
  function HuronFeaturesCtrl($scope, $state, $filter, $timeout, $modal, $q, Authinfo, HuronFeaturesListService, HuntGroupService, AutoAttendantCeInfoModelService, AAModelService, Notification, Log) {

    var vm = this;
    vm.searchData = searchData;
    vm.setFilter = setFilter;
    vm.openModal = openModal;
    vm.reload = reload;
    vm.filters = [];
    vm.listOfFeatures = [];
    vm.pageState = '';
    vm.filterText = '';
    vm.placeholder = {};
    vm.cardColor = {};
    vm.aaModel = {};
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
    var listOfAllFeatures = [];
    var featureToBeDeleted = {};
    var customerId = Authinfo.getOrgId();

    /* LIST OF FEATURES
     *
     *  To add a New Feature
     *  1. Define the service to get the list of feature
     *  2. Inject the features Service into the Controller
     *  3. Add the Object for the feature in the format of the Features Array Object (features)
     *  4. Define the SuccessHandler
     * */
    var features = [{
      name: 'AA',
      service: AutoAttendantCeInfoModelService.getCeInfosList,
      successHandler: HuronFeaturesListService.autoAttendants,
      isEmpty: false,
      i18n: 'huronFeatureDetails.aaName',
      color: 'primary'
    }, {
      name: 'HG',
      service: HuntGroupService.getListOfHuntGroups,
      successHandler: HuronFeaturesListService.huntGroups,
      isEmpty: false,
      i18n: 'huronFeatureDetails.hgName',
      color: 'alerts'
    }];

    angular.forEach(features, function (feature) {
      vm.cardColor[feature.name] = feature.color;
    });

    init();

    function init() {

      vm.pageState = 'Loading';
      var featuresPromises = getListOfFeatures();

      handleFeaturePromises(featuresPromises);

      $q.all(featuresPromises).then(function (responses) {
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

    function getListOfFeatures() {
      var promises = [];
      features.forEach(function (value) {
        promises.push(value.service(customerId));
      });
      return promises;
    }

    function handleFeaturePromises(promises) {
      angular.forEach(features, function (feature, index) {
        promises[index].then(function (data) {
          handleFeatureData(data, feature);
        }, function (response) {
          handleFailures(response, feature);
        });
      });
    }

    function handleFailures(response, feature) {
      Log.warn('Could fetch features for customer with Id:', Authinfo.getOrgId());

      feature.isEmpty = true;

      Notification.errorResponse(response, 'huronFeatureDetails.failedToLoad', {
        featureType: $filter('translate')(feature.i18n)
      });

      showReloadPageIfNeeded();
    }

    function handleFeatureData(data, feature) {

      if (feature.name === 'AA') {
        vm.aaModel = AAModelService.newAAModel();
        vm.aaModel = data;
      }

      var list = feature.successHandler(data);
      if (list.length > 0) {

        if (feature.name === 'AA') {
          AAModelService.setAAModel(vm.aaModel);
        }

        vm.pageState = 'showFeatures';
        feature.isEmpty = false;
        vm.listOfFeatures = vm.listOfFeatures.concat(list);
        listOfAllFeatures = listOfAllFeatures.concat(list);
      } else if (list.length === 0) {
        feature.isEmpty = true;
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

    function areFeaturesEmpty() {
      var isEmpty = true;
      features.forEach(function (feature) {
        isEmpty = isEmpty && feature.isEmpty;
      });
      return isEmpty;
    }

    function isFeatureListEmpty() {

      if (vm.pageState !== 'showFeatures' && areFeaturesEmpty() && vm.listOfFeatures.length === 0) {
        vm.pageState = 'NewFeature';
      }
    }

    function showReloadPageIfNeeded() {
      if (vm.pageState === 'Loading' && areFeaturesEmpty() && vm.listOfFeatures.length === 0) {
        vm.pageState = 'Reload';
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
