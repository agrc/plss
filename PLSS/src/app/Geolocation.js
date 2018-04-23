define([
    'dojo/Deferred'
], function (
    Deferred
) {
    return {
        options: {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        },
        promise: new Deferred(),

        getCurrentPosition: function (navigator) {
            console.info('app/Geolocation:getCurrentPosition');

            if (this.promise.isFulfilled()) {
                this.promise = new Deferred();
            }

            if (!navigator.geolocation) {
                console.warn('Geolocation is not supported.');
                this.promise.reject('Geolocation is not supported');

                return this.promise;
            }

            navigator.geolocation.getCurrentPosition(
                function (position) {
                    return this.promise.resolve(position)
                }.bind(this),
                function (err) {
                    return this.promise.reject(err)
                }.bind(this),
                this.options
            );

            return this.promise;
        }
    };
});
