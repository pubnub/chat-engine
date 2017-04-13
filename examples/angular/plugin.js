angular.module('open-chat-framework', [])
.service('ngOCF', ['$timeout', function($timeout) {

    this.bind = function(OCF) {

        // updates angular when anything changes
        OCF.onAny(function(event, payload) {
            $timeout(function() {});
        });

    }

}]);
