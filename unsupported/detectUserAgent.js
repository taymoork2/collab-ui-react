/* eslint-disable */
(function () {
  /** start UserAgent Detection **/
  // - DO NOT USE OR EXTEND THIS CODE - this code will be removed before 2/3/2017
  if (window.navigator.userAgent.indexOf('QtCarBrowser') > -1) {
    var el = document.createElement('div');
    el.innerHTML = '<div>WARNING - Unsupported browser: ' + window.navigator.userAgent + '</div>';
    document.body.appendChild(el);
  }
  /** end UserAgent Detections and Support **/
})();
