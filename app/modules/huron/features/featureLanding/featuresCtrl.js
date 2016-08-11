(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('HuronFeaturesCtrl', HuronFeaturesCtrl);

  /* @ngInject */
  function HuronFeaturesCtrl($scope, $state, $filter, $timeout, $modal, $q, $translate, Authinfo, HuronFeaturesListService, HuntGroupService, CallParkService, AutoAttendantCeInfoModelService, Notification, Log, FeatureToggleService) {

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
    vm.noFeatures = false;
    vm.loading = true;
    vm.placeholder = {
      'name': 'Search'
    };
    vm.filters = [{
      name: $translate.instant('common.all'),
      filterValue: 'all'
    }, {
      name: $translate.instant('autoAttendant.title'),
      filterValue: 'AA'
    }, {
      name: $translate.instant('huronHuntGroup.modalTitle'),
      filterValue: 'HG'
    }];

    FeatureToggleService.supports(FeatureToggleService.features.callParkService).then(function (result) {
      if (result) {
        var cp = {
          name: $translate.instant('callPark.title'),
          filterValue: 'CP'
        };
        vm.filters.push(cp);
      }
    });
    /* LIST OF FEATURES
     *
     *  To add a New Feature
     *  1. Define the service to get the list of feature
     *  2. Inject the features Service into the Controller
     *  3. Add the Object for the feature in the format of the Features Array Object (features)
     *  4. Define the formatter
     * */
    vm.features = [{
      name: 'HG',
      getFeature: HuntGroupService.getListOfHuntGroups,
      formatter: HuronFeaturesListService.huntGroups,
      isEmpty: false,
      i18n: 'huronFeatureDetails.hgName',
      color: 'alerts'
    }, {
      name: 'AA',
      getFeature: AutoAttendantCeInfoModelService.getCeInfosList,
      formatter: HuronFeaturesListService.autoAttendants,
      isEmpty: false,
      i18n: 'huronFeatureDetails.aaName',
      color: 'primary'
    }, {
      name: 'CP',
      getFeature: CallParkService.getListOfCallParks,
      formatter: HuronFeaturesListService.callParks,
      isEmpty: false,
      i18n: 'huronFeatureDetails.cpName',
      color: 'cta'
    }];

    init();

    function init() {
      vm.loading = false;

      _.forEach(vm.features, function (feature) {
        vm.cardColor[feature.name] = feature.color;
      });

      vm.pageState = 'Loading';
      var featuresPromises = getListOfFeatures();

      handleFeaturePromises(featuresPromises);

      $q.all(featuresPromises).then(function () {
        showNewFeaturePageIfNeeded();
      });
    }

    //Switches Data that populates the Features tab
    function setFilter(filterValue) {
      vm.listOfFeatures = HuronFeaturesListService.filterCards(listOfAllFeatures, filterValue, vm.filterText);
      reInstantiateMasonry();
    }

    /* This function does an in-page search for the string typed in search box*/
    function searchData(searchStr) {
      vm.filterText = searchStr;
      vm.listOfFeatures = HuronFeaturesListService.filterCards(listOfAllFeatures, 'all', vm.filterText);
      reInstantiateMasonry();
    }

    function reload() {
      $state.go($state.current, {}, {
        reload: true
      });
    }

    function getListOfFeatures() {
      var promises = [];
      vm.features.forEach(function (value) {
        promises.push(value.getFeature());
      });
      return promises;
    }

    function handleFeaturePromises(promises) {
      _.forEach(vm.features, function (feature, index) {
        promises[index].then(function (data) {
          handleFeatureData(data, feature);
        }, function (response) {
          handleFailures(response, feature);
        });
      });
    }

    function handleFailures(response, feature) {

      Log.warn('Could fetch features for customer with Id:', Authinfo.getOrgId());
      Notification.errorResponse(response, 'huronFeatureDetails.failedToLoad', {
        featureType: $filter('translate')(feature.i18n)
      });

      feature.isEmpty = true;

      showReloadPageIfNeeded();
    }

    function handleFeatureData(data, feature) {

      if (feature.name === 'AA') {
        vm.aaModel = data;
      }

      var list = feature.formatter(data);
      if (list.length > 0) {
        vm.pageState = 'showFeatures';
        feature.isEmpty = false;
        vm.listOfFeatures = vm.listOfFeatures.concat(list);
        vm.listOfFeatures = HuronFeaturesListService.orderByFilter(vm.listOfFeatures);
        listOfAllFeatures = listOfAllFeatures.concat(list);
      } else if (list.length === 0) {
        feature.isEmpty = true;
        showReloadPageIfNeeded();
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
      } else if (feature.filterValue === 'CP') {
        $state.go('callparkedit', {
          feature: feature
        });
      }
    };

    vm.deleteHuronFeature = function (feature) {
      if (feature.hasDepends) {
        Notification.error('huronFeatureDetails.aaDeleteBlocked', {
          aaNames: feature.dependsNames.join(", ")
        });
        return;
      }

      featureToBeDeleted = feature;
      $state.go('huronfeatures.deleteFeature', {
        deleteFeatureName: feature.cardName,
        deleteFeatureId: feature.id,
        deleteFeatureType: feature.filterValue
      });
    };

    vm.detailsHuronFeature = function (feature) {
      $state.go('huronfeatures.aaListDepends', {
        detailsFeatureName: feature.cardName,
        detailsFeatureId: feature.id,
        detailsFeatureType: feature.filterValue,
        detailsDependsList: feature.dependsNames
      });
    };

    function areFeaturesEmpty() {
      var isEmpty = true;
      _.forEach(vm.features, function (feature) {
        isEmpty = isEmpty && feature.isEmpty;
      });
      return isEmpty;
    }

    function showNewFeaturePageIfNeeded() {

      if (vm.pageState !== 'showFeatures' && areFeaturesEmpty() && vm.listOfFeatures.length === 0) {
        vm.pageState = 'NewFeature';
      } else {
        reInstantiateMasonry();
      }
    }

    function reInstantiateMasonry() {
      $timeout(function () {
        $('.cs-card-layout').masonry('destroy');
        $('.cs-card-layout').masonry({
          itemSelector: '.cs-card',
          columnWidth: '.cs-card',
          isResizable: true,
          percentPosition: true
        });
      }, 0);
    }

    function showReloadPageIfNeeded() {
      if (vm.pageState === 'Loading' && areFeaturesEmpty() && vm.listOfFeatures.length === 0) {
        vm.pageState = 'Reload';
      }
    }

    //list is updated by deleting a feature
    $scope.$on('HURON_FEATURE_DELETED', function () {
      vm.listOfFeatures.splice(vm.listOfFeatures.indexOf(featureToBeDeleted), 1);
      listOfAllFeatures.splice(listOfAllFeatures.indexOf(featureToBeDeleted), 1);

      if (featureToBeDeleted.filterValue === 'AA' && featureToBeDeleted.hasReferences) {
        _.forEach(featureToBeDeleted.referenceNames, function (ref) {
          var cardToRefresh = _.find(listOfAllFeatures, function (feature) {
            return feature.cardName === ref;
          });
          if (angular.isDefined(cardToRefresh)) {
            cardToRefresh.dependsNames.splice(cardToRefresh.dependsNames.indexOf(featureToBeDeleted.cardName), 1);
            if (cardToRefresh.dependsNames.length === 0) {
              cardToRefresh.hasDepends = false;
            }
          }
        });
      }

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
