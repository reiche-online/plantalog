/*
 *  plantalog.js für Plantalog webapp
 *
 *  Umesetzung einer Webapplication mit:
 *  - Node.js
 *  - express.js
 *  - angular.js
 *  - mongoDB
 *
 *  Dies ist die Angular Webapp für das Frontend von plantalog.
 *
 *  Ich werde hier anders kommentieren als in den Server JS Files
 *  Eher dem Standard von Frontendentwicklern folgend, mit inline
 *  Kommentaren
 *
 *  Author: Marcus Reiche
 */

//  Initialisieren der Webapp
var plantalogApp = angular.module('plantalogApp', ['ngRoute','ngSanitize']);

//  Das Routing der Webapp definieren (Home / Plants)  Controller & Views zuweisen
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
        //Redirect zur Homepage falls der Nutzer unpassende URLS eingibt (404)
        redirectTo: '/'
    });
}]);

//  Der Controller für die Hauptseite
plantalogApp.controller('MainCtrl', ['$scope', '$http', function(scope, http) {

    // Anpassen des Layouts für die Homepage
    jQuery('.navbar').hide();
    jQuery('.main-wrapper').css('margin-top', '0');

    // Die Funktion welche bei der Eingabe ins Suchfeld ausgeführt wird
    scope.onQuery = function() {
        if(scope.query) {

            var ajaxRoute = 'api/find?input='+scope.query;
            // Ajax Request um alle die Pflanzen zu finden die der Suche genügen
            http({
                method: 'GET',
                url: ajaxRoute,
                cache: true
            }).success(function(data) {
                // Die Antwort des Ajax Requests wird Scope, somit der App übergeben
                scope.plants = data;
                for(var i = 0; i < scope.plants.length; i++) {
                    // Rewrite des Namens der Pflanze, um die Images zu finden
                    var tempName = scope.plants[i].name.toLowerCase();
                    tempName = tempName.replace(/\u00e4/g, 'ae');
                    tempName = tempName.replace(/\u00F6/g, 'oe');
                    tempName = tempName.replace(/\u00FC/g, 'ue');
                    tempName = tempName.replace(/\u00DF/g, 'ss');
                    scope.plants[i].imgsrc = "img/50/"+tempName+".jpg";
                }
            });
        }else {
            // Falls der Nutzer nichts eingegeben hat wird die Information wieder gelöscht, sodass die Seite wieder leer ist
            scope.plants = [];
        }
    }
}]);

// Controller für die Detailseiten
plantalogApp.controller('DetailCtrl', ['$scope', '$http', '$routeParams', '$location', function(scope, http, routeParams, location) {

    // Anpassen des Layouts für die Homepage
    jQuery('.navbar').show();
    jQuery('.main-wrapper').css('margin-top', '65px');
    var ajaxRoute = 'api/plant?name='+routeParams.plantName;

    // Ajax Request um die Informationen zur Pflanze zu laden
    http({
        method: 'GET',
        url: ajaxRoute,
        cache: true
    }).success(function(data) {
        if(data != 'null'){

            // Die Antwort des Ajax Requests wird Scope, somit der App übergeben
            scope.plant = data;
            // Rewrite des Namens der Pflanze, um die Images zu finden
            var tempName = scope.plant.name.toLowerCase();
            tempName = tempName.replace(/\u00e4/g, 'ae');
            tempName = tempName.replace(/\u00F6/g, 'oe');
            tempName = tempName.replace(/\u00FC/g, 'ue');
            tempName = tempName.replace(/\u00DF/g, 'ss');
            scope.plant.imgsrc = "img/250/"+tempName+".jpg";

        } else {

            // Falls keine Pflanze gefunden wurde wird der Nutzer auf die Homepage redirectet
            location.path('/');
        }
    });

    // Wenn die Seite geladen ist werden die Boxen nacheinander sichtbar geschalten
    angular.element(document).ready(function() {
        var i = 1;
        jQuery('.onloadhide').each(function() {
           showContentbox(i,jQuery(this));
            i++;
        });
    });

    // Funktion um Informationen über Krankheiten anzeigen zu lassen
    scope.getIllness = function(illness) {
        var illnessRoute = 'api/illness?name='+illness;

        // Ajax Request um die Informationen zur Krankheit zu laden
        http({
            method: 'GET',
            url: illnessRoute,
            cache: true
        }).success(function(data) {
            // Die Antwort des Ajax Requestes wird Scope übergeben und die Infobox wird angezeigt
            scope.illness =  data;
            jQuery('.illness-list').hide();
            jQuery('.illness-detail').show();
        });

    }

    // Funktion um die Infobox der Krankheiten zu schließen
    scope.getIllnessList = function() {
        jQuery('.illness-detail').hide();
        jQuery('.illness-list').show();
    }
}]);

// Controller welcher die Minisearch im Header steuert
plantalogApp.controller('SearchCtrl', ['$scope', '$http', '$routeParams', function(scope, http) {
    // Die Funktion welche bei der Eingabe ins Suchfeld ausgeführt wird
    scope.onheaderQuery = function() {
        if(scope.query) {

            var ajaxRoute = 'api/find?input='+scope.query;
            // Ajax Request um alle die Pflanzen zu finden die der Suche genügen
            http({
                method: 'GET',
                url: ajaxRoute,
                cache: true
            }).success(function(data) {
                // Die Antwort des Ajax Requests wird Scope, somit der App übergeben
                scope.searchs = data;
                for(var i = 0; i < scope.searchs.length; i++) {
                    // Rewrite des Namens der Pflanze, um die Images zu finden
                    var tempName = scope.searchs[i].name.toLowerCase();
                    tempName = tempName.replace(/\u00e4/g, 'ae');
                    tempName = tempName.replace(/\u00F6/g, 'oe');
                    tempName = tempName.replace(/\u00FC/g, 'ue');
                    tempName = tempName.replace(/\u00DF/g, 'ss');
                    scope.searchs[i].imgsrc = "img/30/"+tempName+".jpg";
                }
            });
        }else {
            // Falls der Nutzer nichts eingegeben hat wird die Information wieder gelöscht, sodass die Seite wieder leer ist
            scope.searchs = [];
        }
    }
    // Funktion um die Suchergebnisse verschwinden zu lassen falls man irgendwo auf der Seite klickt
    scope.hideSearch = function() {
        jQuery('.resultwrapper').hide();
        scope.query = '';
        scope.searchs = [];
    }
}]);

// Funktion um die Boxen nacheinander einfaden zu lassen
function showContentbox(i,object){
    setTimeout(function() {
        object.fadeIn();
    },250*i)
}

// Funktionen welche helfen die Header Suche angenehmer für den User zu machen
jQuery(document).ready(function() {
    var searchinput = jQuery('.searchwrapper .search');
    searchinput.on('focusout',function() {
        if(jQuery('.resultwrapper:hover').length == 0) {
            jQuery('.resultwrapper').hide();
        }
    });
    searchinput.on('focusin', function() {
        jQuery('.resultwrapper').show();
    });
});

