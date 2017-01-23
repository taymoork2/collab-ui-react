(function () {
  'use strict';

  angular
      .module('Sunlight')
      .controller('CareFeaturesCtrl', CareFeaturesCtrl);

  /* @ngInject */
  function CareFeaturesCtrl($filter, $modal, $q, $translate, $state, $scope, Authinfo, CardUtils, CareFeatureList, CTService, Log, Notification, FeatureToggleService) {
    var vm = this;
    vm.init = init;
    var pageStates = {
      newFeature: 'NewFeature',
      showFeatures: 'ShowFeatures',
      loading: 'Loading',
      error: 'Error'
    };
    var listOfChatFeature = [];
    var listOfCallbackFeature = [];
    var listOfAllFeatures = [];
    var featureToBeDeleted = {};
    vm.searchData = searchData;
    vm.deleteCareFeature = deleteCareFeature;
    vm.openEmbedCodeModal = openEmbedCodeModal;
    vm.listOfFeatures = [];
    vm.pageState = pageStates.loading;
    vm.cardColor = {};
    vm.placeholder = {
      name: 'Search'
    };
    vm.filterText = '';
    vm.template = null;
    vm.openNewCareFeatureModal = openNewCareFeatureModal;
    vm.setFilter = setFilter;
    /* LIST OF FEATURES
     *
     *  To add a New Feature (like Voice Templates)
     *  1. Define the service to get the list of feature
     *  2. Inject the features Service into the Controller
     *  3. Add the Object for the feature in the format of the Features Array Object (features)
     *  4. Define the formatter
     * */
    vm.features = [{
      order: 0,
      name: 'Ch',
      getFeature: CareFeatureList.getChatTemplates,
      formatter: CareFeatureList.formatChatTemplates,
      i18n: 'careChatTpl.chatTemplate',
      isEmpty: false,
      color: 'primary'
    }, {
      order: 1,
      name: 'Ca',
      getFeature: CareFeatureList.getCallbackTemplates,
      formatter: CareFeatureList.formatCallbackTemplates,
      i18n: 'careChatTpl.chatTemplate',
      isEmpty: false,
      color: 'alerts'
    }];
    vm.filters = [];
    FeatureToggleService.atlasCareCallbackTrialsGetStatus().then(function (result) {
      if (result) {
        vm.filters = [{
          name: $translate.instant('common.all'),
          filterValue: 'all'
        }, {
          name: $translate.instant('sunlightDetails.chatMediaType'),
          filterValue: 'chat'
        }, {
          name: $translate.instant('sunlightDetails.callbackMediaType'),
          filterValue: 'callback'
        }];
      }
    });
    init();

    function init() {
      vm.pageState = pageStates.loading;

      _.forEach(vm.features, function (feature) {
        vm.cardColor[feature.name] = feature.color;
      });

      var featuresPromises = getListOfFeatures();

      handleFeaturePromises(featuresPromises);

      $q.all(featuresPromises).then(function () {
        showNewFeaturePageIfNeeded();
      }).finally(function () {
        var flatList = _.filter(_.flatten(listOfAllFeatures));
        if (flatList.length > 0) {
          vm.listOfFeatures = vm.listOfFeatures.concat(flatList);
          vm.pageState = pageStates.showFeatures;
        }
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
        feature.isEmpty = false;
        if (feature.order === 0) {
          listOfChatFeature = list;
        } else {
          listOfCallbackFeature = list;
        }
        listOfAllFeatures = listOfChatFeature.concat(listOfCallbackFeature);
      } else if (list.length === 0) {
        feature.isEmpty = true;
        showReloadPageIfNeeded();
      }
    }

    function getListOfFeatures() {
      var promises = [];
      _.forEach(vm.features, function (value) {
        promises.push(value.getFeature());
      });
      return promises;
    }

    function handleFailures(response, feature) {
      vm.pageState = pageStates.error;
      Log.warn('Could not fetch features for customer with Id:', Authinfo.getOrgId());
      Notification.errorWithTrackingId(response, 'careChatTpl.failedToLoad', {
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
      CardUtils.resize();
    }

    function showReloadPageIfNeeded() {
      if (vm.pageState === pageStates.loading && areFeaturesEmpty() && vm.listOfFeatures.length === 0) {
        vm.pageState = pageStates.error;
      }
    }

    //Switches Data that populates the Features tab
    function setFilter(filterValue) {
      vm.listOfFeatures = CareFeatureList.filterCards(listOfAllFeatures, filterValue, vm.filterText);
      reInstantiateMasonry();
    }

    /* This function does an in-page search for the string typed in search box*/
    function searchData(searchStr) {
      vm.filterText = searchStr;
      vm.listOfFeatures = CareFeatureList.filterCards(listOfAllFeatures, 'all', vm.filterText);
      reInstantiateMasonry();
    }

    vm.editCareFeature = function (feature) {
      CareFeatureList.getTemplate(feature.templateId).then(function (template) {
        $state.go('care.setupAssistant', {
          isEditFeature: true,
          template: template,
          type: template.configuration.mediaType
        });
      });
    };

    function deleteCareFeature(feature) {
      featureToBeDeleted = feature;
      $state.go('care.Features.DeleteFeature', {
        deleteFeatureName: feature.name,
        deleteFeatureId: feature.templateId,
        deleteFeatureType: feature.featureType
      });
    }

    function openEmbedCodeModal(feature) {
      CTService.openEmbedCodeModal(feature.templateId, feature.name);
    }

    function openNewCareFeatureModal() {
      $modal.open({
        templateUrl: 'modules/sunlight/features/featureLanding/newCareFeatureModal.tpl.html',
        controller: 'NewCareFeatureModalCtrl',
        controllerAs: 'NewCareFeatureModalCtrl'
      });
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
