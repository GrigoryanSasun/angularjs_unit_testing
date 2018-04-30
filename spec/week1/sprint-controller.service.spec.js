describe('SpringControllerService', function () {

    var $timeout;
    var $http;
    var $cookies;
    var $q;

    var springCtrlService;

    var url;

    beforeEach(function () {
        window.jQuery = jasmine.createSpyObj('jQuery', ['param']);
        $cookies = {};
        url = 'http://example.com';
    });

    describe('get', function () {
        describe('long wait timeout', function () {
            beforeEach(function () {
                $timeout = jasmine.createSpy('timeoutSpy');

                module('ExampleModule', {
                    '$timeout': $timeout,
                    '$cookies': $cookies
                });

                inject(function (SpringControllerService) {
                    springCtrlService = SpringControllerService;
                });
            });

            it('should not notify about long awaiting request if no notification options were provided', function () {
                springCtrlService.get(url, {}, null);

                // Vefiry that timeout was not called
                expect($timeout).not.toHaveBeenCalled();
            });

            it('should notify about long awaiting request with the provided options timeout', function () {
                var waitTime = 2000;

                var notificationOptions = {
                    longWaitTime: waitTime
                };

                springCtrlService.get(url, {}, notificationOptions);

                expect($timeout).toHaveBeenCalledWith(jasmine.any(Function), waitTime);
            });

            it('should notify about long awaiting request with the default timeout if notification options does not provide the timeout', function () {
                var notificationOptions = {};

                springCtrlService.get(url, {}, notificationOptions);

                expect($timeout).toHaveBeenCalledWith(jasmine.any(Function), 5000);
            });
        });

        describe('http request', function () {
            beforeEach(function () {
                $http = jasmine.createSpy('httpSpy').and.callFake(function () {
                    var result = {
                        success: function () {
                            return result;
                        },
                        error: function () {
                            return result;
                        }
                    };
                    return result;
                });
            });

            it('should make an http request with session id from the cookie', function () {

                var sessionId = '123456';
                $cookies.attask = sessionId + '#';

                module('ExampleModule', {
                    '$http': $http,
                    '$cookies': $cookies
                });


                inject(function (SpringControllerService) {
                    springCtrlService = SpringControllerService;

                    springCtrlService.get(url, null, null);

                    argument = $http.calls.argsFor(0)[0];

                    expect(argument.method).toBe('GET');
                    expect(argument.url).toBe(url);
                    expect(argument.headers).toEqual({
                        'Content-Type': 'application/x-www-form-urlencoded',
                        sessionID: sessionId
                    });
                    expect(argument.data).toBeUndefined();
                });
            });

            it('should make an http request with empty session id if not found in cookie', function () {
                module('ExampleModule', {
                    '$http': $http,
                    '$cookies': $cookies
                });


                inject(function (SpringControllerService) {
                    springCtrlService = SpringControllerService;

                    springCtrlService.get(url, null, null);

                    argument = $http.calls.argsFor(0)[0];

                    expect(argument.method).toBe('GET');
                    expect(argument.url).toBe(url);
                    expect(argument.headers).toEqual({
                        'Content-Type': 'application/x-www-form-urlencoded',
                        sessionID: ''
                    });
                    expect(argument.data).toBeUndefined();
                    expect(window.jQuery.param).toHaveBeenCalledWith({});
                });
            });

            it('should send the provided data object', function() {
                module('ExampleModule', {
                    '$http': $http,
                    '$cookies': $cookies
                });


                inject(function (SpringControllerService) {
                    springCtrlService = SpringControllerService;

                    var data = {
                        prop: 'value'
                    };

                    springCtrlService.get(url, data, null);

                    argument = $http.calls.argsFor(0)[0];

                    expect(argument.method).toBe('GET');
                    expect(argument.url).toBe(url);
                    expect(argument.headers).toEqual({
                        'Content-Type': 'application/x-www-form-urlencoded',
                        sessionID: ''
                    });
                    expect(window.jQuery.param).toHaveBeenCalledWith(data);
                });
            });
        });

    });
});