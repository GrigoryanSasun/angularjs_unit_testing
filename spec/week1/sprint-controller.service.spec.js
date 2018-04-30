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

    ['get', 'post'].forEach(function (method) {
        // Test suites for both get and post methods
        var methodUppercased = method.toUpperCase();
        describe(method, function () {
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
                    springCtrlService[method](url, {}, null);

                    // Vefiry that timeout was not called
                    expect($timeout).not.toHaveBeenCalled();
                });

                it('should notify about long awaiting request with the provided options timeout', function () {
                    var waitTime = 2000;

                    var notificationOptions = {
                        longWaitTime: waitTime
                    };

                    springCtrlService[method](url, {}, notificationOptions);

                    expect($timeout).toHaveBeenCalledWith(jasmine.any(Function), waitTime);
                });

                it('should notify about long awaiting request with the default timeout if notification options does not provide the timeout', function () {
                    var notificationOptions = {};

                    springCtrlService[method](url, {}, notificationOptions);

                    expect($timeout).toHaveBeenCalledWith(jasmine.any(Function), 5000);
                });
            });

            describe('when called', function () {
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

                        springCtrlService[method](url, null, null);

                        argument = $http.calls.argsFor(0)[0];

                        expect(argument.method).toBe(methodUppercased);
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

                        springCtrlService[method](url, null, null);

                        argument = $http.calls.argsFor(0)[0];

                        expect(argument.method).toBe(methodUppercased);
                        expect(argument.url).toBe(url);
                        expect(argument.headers).toEqual({
                            'Content-Type': 'application/x-www-form-urlencoded',
                            sessionID: ''
                        });
                        expect(argument.data).toBeUndefined();
                        expect(window.jQuery.param).toHaveBeenCalledWith({});
                    });
                });

                it('should send the provided data object', function () {
                    module('ExampleModule', {
                        '$http': $http,
                        '$cookies': $cookies
                    });


                    inject(function (SpringControllerService) {
                        springCtrlService = SpringControllerService;

                        var data = {
                            prop: 'value'
                        };

                        springCtrlService[method](url, data, null);

                        argument = $http.calls.argsFor(0)[0];

                        expect(argument.method).toBe(methodUppercased);
                        expect(argument.url).toBe(url);
                        expect(argument.headers).toEqual({
                            'Content-Type': 'application/x-www-form-urlencoded',
                            sessionID: ''
                        });
                        expect(window.jQuery.param).toHaveBeenCalledWith(data);
                    });
                });

                describe('and http request sent', function () {
                    var $httpBackend;

                    beforeEach(function () {
                        $timeout = jasmine.createSpyObj('timeoutSpy', ['cancel']);
                        module('ExampleModule', {
                            '$timeout': $timeout,
                            '$cookies': $cookies
                        });

                        inject(function (_$q_, _$httpBackend_, _$rootScope_, SpringControllerService) {
                            $q = _$q_;
                            $httpBackend = _$httpBackend_;
                            springCtrlService = SpringControllerService;
                        });
                    });

                    afterEach(function () {
                        expect($timeout.cancel).toHaveBeenCalled();
                    });

                    describe('when call succeeds', function () {

                        it('should reject with null if non-object is returned', function () {
                            $httpBackend.expect(methodUppercased, url)
                                .respond(200, 'non-object');
                            springCtrlService[method](url, null, null)
                                .then(function () {
                                    throw new Error('Should not resolve')
                                })
                                .catch(function (err) {
                                    expect(err).toBeNull();
                                });
                            $httpBackend.flush();
                        });

                        it('should resolve with result data if data property exists', function () {
                            var data = 'data';

                            $httpBackend.expect(methodUppercased, url)
                                .respond(200, {
                                    data: data
                                });

                            springCtrlService[method](url, null, null)
                                .then(function (resolvedData) {
                                    expect(resolvedData).toEqual(data);
                                })
                                .catch(function (err) {
                                    throw new Error('should not fail');
                                });
                            $httpBackend.flush();

                        });


                        it('should reject with result error if error property exists', function () {
                            var error = 'error';

                            $httpBackend.expect(methodUppercased, url)
                                .respond(200, {
                                    error: error
                                });

                            springCtrlService[method](url, null, null)
                                .then(function () {
                                    throw new Error('should not resolve');
                                })
                                .catch(function (rejectedError) {
                                    expect(rejectedError).toEqual(error);
                                });
                            $httpBackend.flush();
                        });

                        it('should resolve with result if data property does not exist and there is no error', function () {
                            var data = {
                                backendData: 'backendData'
                            };

                            $httpBackend.expect(methodUppercased, url)
                                .respond(200, data);

                            springCtrlService[method](url, null, null)
                                .then(function (resolvedData) {
                                    expect(resolvedData).toEqual(data);
                                })
                                .catch(function (err) {
                                    throw new Error('should not fail');
                                });
                            $httpBackend.flush();

                        });
                    });

                    describe('when call fails', function () {
                        it('should reject with response message if message property exists', function () {
                            var data = {
                                message: 'errorMessage'
                            };

                            $httpBackend.expect(methodUppercased, url)
                                .respond(400, data);

                            springCtrlService[method](url, null, null)
                                .then(function (resolvedData) {
                                    throw new Error('should not succeed');
                                })
                                .catch(function (err) {
                                    expect(err).toBe(data.message);
                                });
                            $httpBackend.flush();
                        });

                        it('should reject with response if message property DOES NOT exist', function () {
                            var data = {
                                error: 'error'
                            };

                            $httpBackend.expect(methodUppercased, url)
                                .respond(400, data);

                            springCtrlService[method](url, null, null)
                                .then(function (resolvedData) {
                                    throw new Error('should not succeed');
                                })
                                .catch(function (err) {
                                    expect(err).toEqual(data);
                                });
                            $httpBackend.flush();
                        });
                    });
                });
            });

        });
    });


});