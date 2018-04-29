angular.module('movieHttpBackendModule', [])
    .factory('movieHttpBackendService', function($q, $http) {
        return {
            getById: function(id) {
                var deferred = $q.defer();
                $http.get('http://movies.com?id=' + id)
                    .then(function(response) {
                        deferred.resolve(response.data);
                    })
                    .catch(function(response) {
                        deferred.reject('error');
                    });
                return deferred.promise;
            },
        };
    });