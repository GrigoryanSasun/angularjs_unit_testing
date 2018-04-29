describe('movieService', function () {
    var httpBackend;
    var movieService;

    beforeEach(function () {
        module('movieHttpBackendModule');
        inject(function (_movieHttpBackendService_, _$httpBackend_) {
            httpBackend = _$httpBackend_;
            movieService = _movieHttpBackendService_;
        });
    });

    describe('getById', function() {
        it('should return the response if succeeds', function() {
            var id = 1;
            var movieData = {
                id: id,
            };

            httpBackend.when('GET', 'http://movies.com?id=' + id)
                .respond(200, movieData);
            
            movieService.getById(id)
                .then(function(movie) {
                    expect(movieData).toEqual(movie);
                });
            // Resolve all pending http requests
            httpBackend.flush();
        });
    });
});