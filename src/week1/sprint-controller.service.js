angular.module('ExampleModule', [])
    .factory('SpringControllerService', ['$http', '$cookies', '$q', '$timeout', function ($http, $cookies, $q, $timeout) {
        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            sessionID: ($cookies.attask || '').split('#')[0]
        };

        var DEFAULT_TIMEOUT = 5000;

        //TODO notification service? like the angular team talked about having a dialog box service

        function requestData(methodType, url, data, notificationOptions) {
            var longWaitTimeout;
            if (notificationOptions != null) {
                longWaitTimeout = $timeout(function () {
                    //notificationOptions can have a longWaitMessage
                    //notificationOptions can have a longWaitType
                    //notificationOptions can have a longWaitTime
                    //Kamino.Widget.require('Notify').notify(message ? message : Kamino.getMessage('longwait'), false, type ? type : "")
                    //console.log('this is taking a long time');
                }, notificationOptions.longWaitTime || DEFAULT_TIMEOUT);
            }

            var deferred = $q.defer();
            var deferredAbort = $q.defer();

            //use some sort of notification service to display a message?, link it to the $promise being fulfilled to clear the timeout
            var request = $http({
                method: methodType,
                url: url,
                headers: headers,
                data: jQuery.param(data || {}),
                timeout: deferredAbort.promise
            }).success(function (result) {
                $timeout.cancel(longWaitTimeout);
                if (typeof result === "object") {
                    if (result.data) {
                        deferred.resolve(result.data);
                    }
                    else if (result.error) {
                        deferred.reject(result.error);
                    }
                    else {
                        deferred.resolve(result);
                    }
                }
                else {
                    deferred.reject(null);
                }

                //deferred.resolve(result && result.data ? result.data : result);
            }).error(function (response) {
                $timeout.cancel(longWaitTimeout);
                deferred.reject(response.message ? response.message : response);
            });

            deferred.promise.abort = deferredAbort.resolve;

            return deferred.promise;
        }

        return {
            get: function (url, data, notificationOptions) {
                return requestData('GET', url, data, notificationOptions);
            },
            post: function (url, data, notificationOptions) {
                return requestData('POST', url, data, notificationOptions);
            }
        };
    }])