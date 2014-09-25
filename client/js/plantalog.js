var plantalogApp = angular.module('plantalogApp', ['ngRoute','ngSanitize']);
var api = 'http://api.plantalog.com/';
plantalogApp.config(['$routeProvider', function(routeProvider) {
    routeProvider.
    when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    }).
    when('/:plantName', {
            templateUrl: 'views/details.html',
            controller: 'DetailCtrl'
    }).
    otherwise({
       redirectTo: '/'
    });
}]);
plantalogApp.controller('MainCtrl', ['$scope', '$http', function(scope, http) {
    jQuery('.navbar').hide();
    jQuery('.main-wrapper').css('margin-top', '0');
    scope.onQuery = function() {
        if(scope.query) {
            var ajaxRoute = api+'namelist?string='+scope.query;
            http({
                method: 'GET',
                url: ajaxRoute,
                cache: true
            }).success(function(data) {
                scope.plants = data;
                for(var i = 0; i < scope.plants.length; i++) {
                    var tempName = scope.plants[i].name.toLowerCase();
                    tempName = tempName.replace(/\u00e4/g, 'ae');
                    tempName = tempName.replace(/\u00F6/g, 'oe');
                    tempName = tempName.replace(/\u00FC/g, 'ue');
                    tempName = tempName.replace(/\u00DF/g, 'ss');
                    scope.plants[i].imgsrc = "img/50/"+tempName+".jpg";
                }
            });
        }else {
            scope.plants = [];
        }
    }
}]);

plantalogApp.controller('DetailCtrl', ['$scope', '$http', '$routeParams', function(scope, http, routeParams) {
    jQuery('.navbar').show();
    jQuery('.main-wrapper').css('margin-top', '65px');
    var ajaxRoute = api+'plant?string='+routeParams.plantName;
    http({
        method: 'GET',
        url: ajaxRoute,
        cache: true
    }).success(function(data) {
        scope.plant = data[0];
        var tempName = scope.plant.name.toLowerCase();
        tempName = tempName.replace(/\u00e4/g, 'ae');
        tempName = tempName.replace(/\u00F6/g, 'oe');
        tempName = tempName.replace(/\u00FC/g, 'ue');
        tempName = tempName.replace(/\u00DF/g, 'ss');
        scope.plant.imgsrc = "img/250/"+tempName+".jpg";
    });
    angular.element(document).ready(function() {
        var i = 1;
        jQuery('.onloadhide').each(function() {
           showContentbox(i,jQuery(this));
            i++;
        });
    });
    scope.getIllness = function(illness) {
        var illnessRoute = api+'illness?id='+illness;
        http({
            method: 'GET',
            url: illnessRoute,
            cache: true
        }).success(function(data) {
            scope.illness =  data[0];
            jQuery('.illness-list').hide();
            jQuery('.illness-detail').show();
        });

    }
    scope.getIllnessList = function() {
        jQuery('.illness-detail').hide();
        jQuery('.illness-list').show();
    }
}]);
function showContentbox(i,object){
    setTimeout(function() {
        object.fadeIn();
    },250*i)
}
plantalogApp.controller('SearchCtrl', ['$scope', '$http', '$routeParams', function(scope, http) {
    scope.onheaderQuery = function() {
        if(scope.query) {
            var ajaxRoute = api+'namelist?string='+scope.query;
            http({
                method: 'GET',
                url: ajaxRoute,
                cache: true
            }).success(function(data) {
                scope.searchs = data;
                for(var i = 0; i < scope.searchs.length; i++) {
                    var tempName = scope.searchs[i].name.toLowerCase();
                    tempName = tempName.replace(/\u00e4/g, 'ae');
                    tempName = tempName.replace(/\u00F6/g, 'oe');
                    tempName = tempName.replace(/\u00FC/g, 'ue');
                    tempName = tempName.replace(/\u00DF/g, 'ss');
                    scope.searchs[i].imgsrc = "img/30/"+tempName+".jpg";
                }
            });
        }else {
            scope.searchs = [];
        }
    }
    scope.hideSearch = function() {
        jQuery('.resultwrapper').hide();
        scope.query = '';
        scope.searchs = [];
    }
}]);
jQuery(document).ready(function() {
    var searchwinput = jQuery('.searchwrapper .search');
    searchwinput.on('focusout',function() {
        if(jQuery('.resultwrapper:hover').length == 0) {
            jQuery('.resultwrapper').hide();
        }
    });
    searchwinput.on('focusin', function() {
        jQuery('.resultwrapper').show();
    });
});

