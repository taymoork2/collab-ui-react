(function () {
  'use strict';

  /* global d3 */

  angular.module('csDonut', []).directive('csDonut', csDonut);

  /* @ngInject */
  function csDonut() {

    return {
      restrict: 'EA',
      scope: {
        value: '=',
        max: '=',
        unlimited: '=',
        ssize: '=',
        tsize: '='
      },

      controller: ['$scope', function controller($scope) {

        //Unique donut id
        $scope.donutId = 'csDonut_' + (Math.floor(Math.random() * 100)).toString();
        //Settings defaults
        $scope.colours = ['#43a942', '#ebebec'];
        if (!$scope.height) {
          $scope.height = 85;
        }
        if (!$scope.width) {
          $scope.width = 85;
        }

        $scope.radius = 2;
        $scope.dataset = [];
        $scope.text = {
          size: 36,
          x: 0,
          y: 14,
          content: '',
          color: '#6A6B6C'
        };

        var colour = d3.scale.category20();
        $scope.currentAngles = {};

        $scope.computeTextProperties = function (value, unlimited, tsize) {
          if (typeof unlimited !== 'undefined' && unlimited === true) {
            $scope.text.size = 18;
            $scope.text.y = 6;
          } else if (typeof value === 'undefined' || value.toString().length > 3) {
            $scope.text.size = 25;
            $scope.text.y = 12;
          } else {
            if (tsize) {
              $scope.text.size = tsize;
              $scope.text.y = 5;
            } else {
              $scope.text.size = 26;
              $scope.text.y = 10;
            }
          }

        };

        $scope.computeDataset = function (value, max, unlimited, ssize) {
          if (typeof ssize !== 'undefined') {
            $scope.width = ssize;
            $scope.height = ssize;
          }
          if (typeof unlimited !== 'undefined' && unlimited === true) {
            $scope.text.content = 'Unlimited';
            $scope.colours = ['#43a942'];
            $scope.text.color = '#6A6B6C';
            $scope.dataset = [1];
          } else if (typeof value === 'undefined' || typeof max === 'undefined' || value > 9999 || max > 9999 || value <= 0 || max <= 0) {
            $scope.text.content = 0;
            $scope.text.color = 'lightgray';
            $scope.dataset = [0, 1];
          } else {
            var fillValue = max - value;
            $scope.text.content = value;
            $scope.text.color = '#6A6B6C';
            $scope.dataset = [value, fillValue];
            if (value > max) {
              $scope.colours = ['#f05d3b'];
              $scope.text.color = '#f05d3b';
              $scope.dataset = [1];
            }
          }
        };

        $scope.getColour = function getColour(colourIndex) {

          // Use the user defined colours if the developer has defined them, and the current index
          // is available.
          if ($scope.colours && $scope.colours.length > colourIndex) {
            return $scope.colours[colourIndex];
          }

          // ...Otherwise we'll fallback to using the D3 category 20 colours.
          return colour(colourIndex);

        };

        $scope.getTranslate = function getTranslate() {
          return 'translate(' + $scope.getWidth() / 2 + ',' + $scope.getHeight() / 2 + ')';
        };

        $scope.getWidth = function getWidth() {
          return $scope.width || 400;
        };

        $scope.getHeight = function getHeight() {
          return $scope.height || 400;
        };

        $scope.getRadius = function getRadius() {
          return $scope.radius || (Math.min($scope.getWidth(), $scope.getHeight()) / 2);
        };

        $scope.clean = function clean(dataset) {

          return dataset.map(function map(value) {

            if ($scope.property) {

              if (isNaN(Number(value[$scope.property]))) {
                value[$scope.property] = 0;
              } else {
                value[$scope.property] = Number(value[$scope.property]);
              }

              return value;

            }

            if (isNaN(Number(value))) {
              return 0;
            }

            return Number(value);

          });

        };

        $scope.tweenArc = function tweenArc(a) {

          var arc = d3.svg.arc().innerRadius($scope.getRadius() - 100).outerRadius($scope.getRadius() - 20),
            i = d3.interpolate(this._current, a);

          this._current = i(0);

          return function donutTween(t) {
            return arc(i(t));
          };

        };
      }],

      link: function link(scope, element) {

        var radius, pie, arc, svg, path, text;
        scope.computeDataset(scope.value, scope.max, scope.unlimited, scope.ssize);
        scope.computeTextProperties(scope.value, scope.unlimited, scope.tsize);
        scope.createDonut = function createDonut() {
          radius = Math.min(scope.getWidth(), scope.getHeight()) / 2;
          pie = d3.layout.pie().sort(null).value(function value(model) {
            return scope.property ? model[scope.property] : model;
          });
          arc = d3.svg.arc().innerRadius(radius).outerRadius(radius - scope.getRadius());
          svg = d3.select(element[0]).append('svg')
            .attr('class', 'cs-donut-svg')
            .attr('width', scope.getWidth())
            .attr('height', scope.getHeight())
            .append('g')
            .attr('transform', scope.getTranslate())
            .attr('id', scope.donutId);

          text = d3.select('#' + scope.donutId).append('text')
            .attr('x', scope.text.x).attr('y', scope.text.y)
            .attr('text-anchor', 'middle')
            .attr('class', 'cs-donut-text')
            .attr('style', 'fill:' + scope.text.color + '; font-size:' + scope.text.size + 'px; font-family:CiscoSansTT Extra Light')
            .text(scope.text.content);

          path = svg.selectAll('path')
            .data(pie(scope.clean(scope.dataset)))
            .enter().append('path')
            .attr('fill', function (d, i) {
              return scope.getColour(i);
            })
            .attr('d', arc)
            .each(function (d) {
              this._current = d;
            });

          if (scope.stroke) {
            path.attr('stroke', scope.stroke);
          }

          if (scope.strokeWidth) {
            path.attr('stroke-width', scope.strokeWidth);
          }

        };

        scope.tweenArc = function tweenArc(arcModel) {

          var i = d3.interpolate(this._current, arcModel);
          this._current = i(0);
          return function (t) {
            return arc(i(t));
          };

        };

        //Listen for changes in the directive attributes
        scope.$watchGroup(['value', 'max', 'unlimited'], function () {
          scope.computeTextProperties(scope.value, scope.unlimited);
          scope.computeDataset(scope.value, scope.max, scope.unlimited);
        });

        // Listen for any changes to the dataset...
        scope.$watch('dataset', function datasetChanged() {
          if (scope.dataset.length === 0) {
            return;
          }
          if (!pie) {
            // Create the donut shape as we have the data.
            scope.createDonut();
            return;
          }
          // Otherwise it's an update as we have an existing donut.
          path.data(pie(scope.clean(scope.dataset)));
          path.transition().duration(750).attrTween('d', scope.tweenArc).each('end', function () {
            text.text(scope.text.content)
              .attr('style', 'fill:' + scope.text.color + '; font-size:' + scope.text.size + 'px; font-family: CiscoSansTT Extra Light;')
              .attr('y', scope.text.y);
            path.attr('fill', function (d, i) {
              return scope.getColour(i);
            });
          });

        }, true);

      }

    };
  }

})();
