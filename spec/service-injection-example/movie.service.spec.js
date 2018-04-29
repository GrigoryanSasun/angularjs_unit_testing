describe('movieService', function () {
    var movieServiceMock;
    var rootScope;

    beforeEach(function () {
        module('movieModule', function ($provide) {
            $provide.factory('movieService', function ($q) {
                return {
                    getById: function (id) {
                        return $q.when({
                            id: id
                        });
                    }
                }
            });
        });
        inject(function (_movieService_, _$rootScope_) {
            rootScope = _$rootScope_;
            movieServiceMock = _movieService_;
        });
    });

    it('should return the movie', function (done) {
        var id = 1;
        movieServiceMock.getById(id)
            .then(function (movie) {
                console.log(movie);

                expect(movie.id).toBe(id);
                done();
            })
            .catch(function(err) {
                done(err);
            });
        // Should simulate digest cycle to resolve the promises
        rootScope.$apply();
    });
});