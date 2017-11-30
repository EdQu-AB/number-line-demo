(function () {
  'use strict';
  angular.module('edquApp.numberLine', []);

  angular.module('edquApp.numberLine')
    .directive('numberLine', function() {
      return {
        restrict: 'EA',
        scope: {
          inputDisabled: '=',
          value: '=',
          bigstep: '@',
          smallstep: '@',
          min: '@',
          max: '@',
          sensitivity: '@',
        },
        link: function(scope, iElement) {
          if(d3.select(iElement[0]).selectAll('svg')[0].length === 0){
            var svg = d3.select(iElement[0])
              .append('svg')
              .attr('width', '100%');
          }

          var SE = d3.locale({
            'decimal': ',',
            'thousands': ' ',
            'grouping': [3],
            'currency': ['', 'kr'],
            'dateTime': '%a %e %b %X %Y',
            'date': '%Y-%m-%d',
            'time': '%H:%M:%S',
            'periods': ['AM', 'PM'],
            'days': ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
            'shortDays': ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'],
            'months': ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli',
                        'Augusti', 'September', 'Oktober', 'November', 'December'],
            'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul',
                            'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
          });


          svg.selectAll('*').remove();
          var height = 80;
          var width = 500;
          var min = typeof scope.min !== 'undefined' ? scope.min : -10;
          var max = typeof scope.max !== 'undefined' ? scope.max : 10;
          var smallstep = typeof scope.smallstep !== 'undefined' ? scope.smallstep : 1;
          var bigstep = typeof scope.bigstep !== 'undefined' ? scope.bigstep : 1;
          var sensitivity = typeof scope.sensitivity !== 'undefined' ? scope.sensitivity : 0.1;
          var invsens = 1/sensitivity;

          svg.attr('height', height);
          var xScale = d3.scale.linear()
            .domain([min, max])
            .range([40, width-40]);

          var length = max - min;
          var smallsteps = length/smallstep;
          var bigsteps = length/bigstep;

          var axis = d3.svg.axis()
            .scale(xScale)
            .ticks(smallsteps)
            .tickSize(5)
            .tickFormat('')
            .orient('bottom');

          var axisnumbers = d3.svg.axis()
            .scale(xScale)
            .ticks(bigsteps)
            .tickSize(10)
            .tickFormat(SE.numberFormat(','))
            .orient('bottom');

          var drag = d3.behavior.drag()
            .origin(function(d) { return d; })
            .on('drag', updateFromView);

          svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,44)')
            .call(axis);

          svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,44)')
            .call(axisnumbers);

          var pointer = svg.selectAll('.point')
            .data([{'x':xScale(scope.value)}]);

          pointer.enter().append('path')
            .attr('class', 'point')
            .attr('d', d3.svg.symbol().type('triangle-down'))
            .attr('transform', function(d) { return 'translate(' + d.x + ',37)'; });

          svg.selectAll('rect')
            .data([0])
            .enter()
            .append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', '#32CC32')
            .attr('opacity',0)
            .attr('y', 0)
            .attr('x', 0)
            .on('click', updateFromView)
            .call(drag);

          function updateFromView() {
            if (scope.inputDisabled === 'true'){
              return;
            }
            var x = d3.mouse(this)[0];
            x = Math.min(x, xScale(max));
            x = Math.max(x, xScale(min));

            pointer.attr('transform', function() {
            return 'translate(' + x + ',37)';
            });

            scope.value = Math.round(xScale.invert(x)*invsens)/invsens;
            scope.$apply();
          }

          scope.$watch(
            function() { return scope.value; },
            function() {
              if (scope.value === undefined) {
                return;
              }
              pointer.attr('transform', function() {
                return 'translate(' + xScale(scope.value) + ',37)';
              });
            }
          );
        }
      };
  });
}());
