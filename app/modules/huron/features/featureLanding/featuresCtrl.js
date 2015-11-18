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
    var listOfAllFeatures = [];
    vm.pageState = '';
    vm.filterText = '';
    vm.placeholder = {};
    vm.cardColor = {};
    vm.aaModel = {};
    var featureToBeDeleted = {};
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
    }];
    /* LIST OF FEATURES
     *
     *  To add a New Feature
     *  1. Define the service to get the list of feature
     *  2. Inject the features Service into the Controller
     *  3. Add the Object for the feature in the format of the Features Array Object (features)
     *  4. Define the formatter
     * */
    var features = [{
      name: 'AA',
      getFeature: AutoAttendantCeInfoModelService.getCeInfosList,
      formatter: HuronFeaturesListService.autoAttendants,
      isEmpty: false,
      isLoaded: false,
      i18n: 'huronFeatureDetails.aaName',
      color: 'primary'
    }, {
      name: 'HG',
      getFeature: HuntGroupService.getListOfHuntGroups,
      formatter: HuronFeaturesListService.huntGroups,
      isEmpty: false,
      isLoaded:false,
      i18n: 'huronFeatureDetails.hgName',
      color: 'alerts'
    }];

    _.forEach(features, function (feature) {
      vm.cardColor[feature.name] = feature.color;
    });

    init();

    function init() {

      vm.pageState = 'Loading';
      var featuresPromises = getListOfFeatures();

      handleFeaturePromises(featuresPromises);

      $q.all(featuresPromises).then(function (responses) {
        showNewFeaturePageIfNeeded();
      });
    }

    //Switches Data that populates the Features tab
    function setFilter(filterValue) {
      vm.listOfFeatures = HuronFeaturesListService.filterCards(listOfAllFeatures, filterValue, vm.filterText);
    }

    /* This function does an in-page search for the string typed in search box*/
    function searchData(searchStr) {
      vm.filterText = searchStr;
      vm.listOfFeatures = HuronFeaturesListService.filterCards(listOfAllFeatures, 'all', vm.filterText);
    }

    function reload() {
      init();
    }

    function getListOfFeatures() {
      var promises = [];
      features.forEach(function (value) {
        promises.push(value.getFeature());
      });
      return promises;
    }

    function handleFeaturePromises(promises) {
      _.forEach(features, function (feature, index) {
        promises[index].then(function (data) {
          feature.isLoaded = true;
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

      var list = feature.formatter(data);
      if (list.length > 0) {

        if (feature.name === 'AA') {
          AAModelService.setAAModel(vm.aaModel);
        }

        vm.pageState = 'showFeatures';
        feature.isEmpty = false;
        vm.listOfFeatures = vm.listOfFeatures.concat(list);
        vm.listOfFeatures = HuronFeaturesListService.orderByFilter(vm.listOfFeatures);
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
        $state.go('huntgroupedit', {
          feature: feature
        });
      }
    };

    vm.deleteHuronFeature = function (feature) {
      featureToBeDeleted = feature;
      $state.go('huronfeatures.deleteFeature', {
        deleteFeatureName: feature.cardName,
        deleteFeatureId: feature.id,
        deleteFeatureType: feature.filterValue
      });
    };

    function areFeaturesPresent() {
      var isPresent = true;
      _.forEach(features, function (feature) {
        isPresent = isPresent && feature.isEmpty && feature.isLoaded;
      });
      return isPresent;
    }

    function showNewFeaturePageIfNeeded() {

      if (vm.pageState !== 'showFeatures' && areFeaturesPresent() && vm.listOfFeatures.length === 0) {
        vm.pageState = 'NewFeature';
      }
    }

    function showReloadPageIfNeeded() {
      if (vm.pageState === 'Loading' && areFeaturesPresent() && vm.listOfFeatures.length === 0) {
        vm.pageState = 'Reload';
      }
    }

    //list is updated by deleting a feature
    $scope.$on('HURON_FEATURE_DELETED', function () {
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
