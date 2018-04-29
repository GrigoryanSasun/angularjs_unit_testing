angular.module('movieModule', [])
    .factory('movieService', function($q) {
        return {
            getById: function(id) {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.resolve({
                        id: id,
                    });
                }, 3000);
                return deferred.promise;
            },
        };
    });