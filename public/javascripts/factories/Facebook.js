angular.module('App').factory('Facebook', function ($http, $window, $q) {
    var f = {}
    $window.fbAsyncInit = function () {
        FB.init({
            appId: 418296831660818,
            status: true,
            cookie: false,
            xfbml: true,
            version: 'v2.3'
        })
    }
        // Load the SDK Asynchronously
    (function (d) {
        var js, id = 'facebook-jssdk';
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        d.getElementsByTagName('head')[0].appendChild(js);
    }(document));

    f.login = function () {
        FB.getLoginStatus(function(res){
            console.log(res);
            if(res.status === 'connected'){
                $http.post('/api/users/fblogin',{accessToken:res.authResponse.accessToken}).
                    success(function(data) {
                        if(data){
                            console.log(data)
                        }
                    })
            } else {
                FB.login(function(res){
                    if(res.status === 'connected'){
                        $http.post('/api/users/addfbuser',{accessToken:res.authResponse.accessToken}).
                            success(function(data) {
                                if(data){
                                    console.log(data)
                                }
                            })
                    }
                });
            }
        });

    }



    return f;
});