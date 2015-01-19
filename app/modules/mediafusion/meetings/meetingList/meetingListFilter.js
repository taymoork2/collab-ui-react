'use strict';

angular.module('Core').filter('meetingListFilter', function ($filter) {
  return function (status) {
    return (status === 'Active') ? $filter('translate')('meetingsPage.active') : $filter('translate')('meetingsPage.pending');
  };
});
