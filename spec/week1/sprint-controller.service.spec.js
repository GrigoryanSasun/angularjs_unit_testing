describe('SpringControllerService', function () {

    var $timeout;

    var springCtrlService;

    beforeEach(function () {

    });

    describe('get', function () {
        describe('long wait timeout', function () {
            beforeEach(function () {
                $timeout = jasmine.createSpy('timeoutSpy');

                module('ExampleModule', {
                    '$timeout': $timeout
                });

                inject(function (SpringControllerService) {
                    springCtrlService = SpringControllerService;
                });
            });

            it('should not notify about long awaiting request if no notification options were provided', function () {
                springCtrlService.get('http://example.com', {}, null);

                // Vefiry that timeout was not called
                expect($timeout).not.toHaveBeenCalled();
            });

            it('should notify about long awaiting request with the provided options timeout', function() {
                var waitTime = 2000;

                var notificationOptions = {
                    longWaitTime: waitTime
                };

                springCtrlService.get('http://example.com', {}, notificationOptions);

                expect($timeout).toHaveBeenCalledWith(jasmine.any(Function), waitTime);
            });

            it('should notify about long awaiting request with the default timeout if notification options does not provide the timeout', function() {
                var notificationOptions = {};

                springCtrlService.get('http://example.com', {}, notificationOptions);

                expect($timeout).toHaveBeenCalledWith(jasmine.any(Function), 5000);
            });
        });

    });
});