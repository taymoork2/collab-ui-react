(function main() {
  'use strict';

  /* global d3 */

  angular.module('ciscoDonut', []).directive('donut', function ciscoDonut() {

    return {
      restrict: 'EA',
      scope: {
        value: '=',
        max: '=',
        unlimited: '='
      },

      controller: ['$scope', function controller($scope) {

        //Settings defaults
        $scope.colours = ['#3CA8E8', 'lightgray'];
        $scope.height = 85;
        $scope.width = 85;
        $scope.radius = 3;
        $scope.dataset = [];
        $scope.text = {
          size: 36,
          x: 0,
          y: 14,
          content: '',
          color: '#3CA8E8'
        };

        var colour = d3.scale.category20();
        $scope.currentAngles = {};

        $scope.computeTextProperties = function (value, unlimited) {
          //console.log(value);
          if (typeof unlimited !== 'undefined' && unlimited === true) {
            $scope.text.size = 18;
            $scope.text.y = 6;
          } else if (typeof value === 'undefined' || value.toString().length > 3) {
            $scope.text.size = 32;
            $scope.text.y = 12;
          } else {
            $scope.text.size = 38;
            $scope.text.y = 14;
          }
        };

        $scope.computeDataset = function (value, max, unlimited) {
          if (typeof unlimited !== 'undefined' && unlimited === true) {
            $scope.dataset = [100];
            $scope.text.content = 'unlimited';
          } else if (typeof value === 'undefined' || typeof max === 'undefined' || value > 9999 || max > 9999) {
            $scope.dataset = [0, 1];
            $scope.text.content = 0;
            $scope.text.color = 'lightgray';
          } else {
            var fillValue = max - value;
            $scope.dataset = [value, fillValue];
            $scope.text.content = value;
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

        var radius, pie, arc, svg, path;
        scope.computeDataset(scope.value, scope.max, scope.unlimited);
        scope.computeTextProperties(scope.value, scope.unlimited);
        scope.createDonut = function createDonut() {
          radius = Math.min(scope.getWidth(), scope.getHeight()) / 2;
          pie = d3.layout.pie().sort(null).value(function value(model) {
            return scope.property ? model[scope.property] : model;
          });
          arc = d3.svg.arc().innerRadius(radius).outerRadius(radius - scope.getRadius());
          svg = d3.select(element[0]).append('svg')
            .attr('width', scope.getWidth())
            .attr('height', scope.getHeight())
            .append('g')
            .attr('transform', scope.getTranslate());

          d3.select('g').append('text')
            .attr('x', scope.text.x).attr('y', scope.text.y)
            .attr('text-anchor', 'middle')
            .attr('class', 'cisco-donut')
            .attr('style', 'fill:' + scope.text.color + '; font-size:' + scope.text.size + 'px;')
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
          path.transition().duration(750).attrTween('d', scope.tweenArc);

        }, true);

      }

    };

  });

})();
