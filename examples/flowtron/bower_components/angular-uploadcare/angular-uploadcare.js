'use strict';

/**
 * @ngdoc directive
 * @name angular-uploadcare.directive:Uploadcare
 * @description Provides a directive for the Uploadcare widget.
 * # Uploadcare
 */
angular.module('ng-uploadcare', [])
  .directive('uploadcareWidget', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        onWidgetReady: '&',
        onUploadComplete: '&',
        onChange: '&',
      },
      controller: ['$scope', '$element', '$attrs', '$parse', '$log', function($scope, $element, $attrs, $parse, $log) {
        if(!uploadcare) {
          $log.error('Uploadcare script has not been loaded!.');
          return;
        }
        $element.attr('type', 'hidden');
        $scope.widget = uploadcare.Widget($element);
        $scope.onWidgetReady({widget: $scope.widget});
        $scope.widget.onUploadComplete(function(info) {
          $scope.onUploadComplete({info: info});
        });
        $scope.widget.onChange(function(file) {
          // add data binding for hidden inputs
          $scope.$apply(function () {
            $parse($attrs.ngModel).assign($scope.$parent, $element.val());
          });
          $scope.onChange({file: file});
        })
      }]
    };
  });
