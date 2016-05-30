(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareFeaturesCtrl', CareFeaturesCtrl);

  /* @ngInject */
  function CareFeaturesCtrl($filter, $q, $state, $scope, $timeout, Authinfo, CareFeatureList, Log, Notification) {
    var vm = this;
    vm.init = init;
    var pageStates = {
      newFeature: 'NewFeature',
      showFeatures: 'ShowFeatures',
      loading: 'Loading',
      error: 'Error'
    };
    var listOfAllFeatures = [];
    var featureToBeDeleted = {};
    vm.searchData = searchData;
    vm.deleteCareFeature = deleteCareFeature;
    vm.listOfFeatures = [];
    vm.pageState = pageStates.loading;
    vm.cardColor = {};
    vm.placeholder = {
      name: 'Search'
    };
    /* LIST OF FEATURES
     *
     *  To add a New Feature (like Voice Templates)
     *  1. Define the service to get the list of feature
     *  2. Inject the features Service into the Controller
     *  3. Add the Object for the feature in the format of the Features Array Object (features)
     *  4. Define the formatter
     * */
    vm.features = [{
      name: 'CT',
      getFeature: CareFeatureList.getChatTemplates,
      formatter: CareFeatureList.formatChatTemplates,
      i18n: 'careChatTpl.chatTemplate',
      isEmpty: false,
      color: 'attention'
    }];
    init();

    function init() {
      vm.pageState = pageStates.loading;

      _.forEach(vm.features, function (feature) {
        vm.cardColor[feature.name] = feature.color;
      });

      var featuresPromises = getListOfFeatures();

      handleFeaturePromises(featuresPromises);

      $q.all(featuresPromises).then(function (responses) {
        showNewFeaturePageIfNeeded();
      });
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

    function handleFeatureData(data, feature) {

      var list = feature.formatter(data);
      if (list.length > 0) {

        vm.pageState = pageStates.showFeatures;
        feature.isEmpty = false;
        vm.listOfFeatures = vm.listOfFeatures.concat(list);
        listOfAllFeatures = listOfAllFeatures.concat(list);
      } else if (list.length === 0) {

        feature.isEmpty = true;
        showReloadPageIfNeeded();
      }
    }

    function getListOfFeatures() {
      var promises = [];
      vm.features.forEach(function (value) {
        promises.push(value.getFeature());
      });
      return promises;
    }

    function handleFailures(response, feature) {
      vm.pageState = pageStates.error;
      Log.warn('Could not fetch features for customer with Id:', Authinfo.getOrgId());
      Notification.errorResponse(response, 'careChatTpl.failedToLoad', {
        featureText: $filter('translate')(feature.i18n)
      });
    }

    function areFeaturesEmpty() {
      var isEmpty = true;
      _.forEach(vm.features, function (feature) {
        isEmpty = isEmpty && feature.isEmpty;
      });
      return isEmpty;
    }

    function showNewFeaturePageIfNeeded() {

      if (vm.pageState !== pageStates.showFeatures && areFeaturesEmpty() && vm.listOfFeatures.length === 0) {
        vm.pageState = pageStates.newFeature;
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
      if (vm.pageState === pageStates.loading && areFeaturesEmpty() && vm.listOfFeatures.length === 0) {
        vm.pageState = pageStates.error;
      }
    }

    /* This function does an in-page search for the string typed in search box*/
    function searchData(searchStr) {
      vm.filterText = searchStr;
      vm.listOfFeatures = CareFeatureList.filterCards(listOfAllFeatures, vm.filterText);
      reInstantiateMasonry();
    }

    function deleteCareFeature(feature) {
      featureToBeDeleted = feature;
      if (feature.featureType == 'CT') {
        $state.go('care.Features.DeleteFeature', {
          deleteFeatureName: feature.name,
          deleteFeatureId: feature.templateId,
          deleteFeatureType: feature.featureType
        });
      }
    }

    //list is updated by deleting a feature
    $scope.$on('CARE_FEATURE_DELETED', function () {
      listOfAllFeatures.splice(listOfAllFeatures.indexOf(featureToBeDeleted), 1);
      vm.listOfFeatures = listOfAllFeatures;
      featureToBeDeleted = {};
      if (listOfAllFeatures.length === 0) {
        vm.pageState = pageStates.newFeature;
      }

    });
  }

})();
