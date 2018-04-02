require('./_convertUsersModal.scss');

angular.module('Core')
  .directive('crConvertUsersModalXxx', directive);

function directive() {
  return {
    template: require('modules/core/convertUsers/convertUsersModal.tpl.html'),
  };
}
