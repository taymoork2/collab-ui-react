require('./_convertUsersModal.scss');

angular.module('Core')
  .directive('crConvertUsersModal', directive);

function directive() {
  return {
    template: require('modules/core/convertUsers/convertUsersModal.tpl.html'),
  };
}
