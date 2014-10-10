/*
 *  plantalog-admin.js für Plantalog webapp
 *
 *  Umesetzung einer Webapplication mit:
 *  - Node.js
 *  - express.js
 *  - angular.js
 *  - mongoDB
 *
 *  Dies ist die Angular Webapp für das Backend von plantalog.
 *
 *  Ich werde hier anders kommentieren als in den Server JS Files
 *  Eher dem Standard von Frontendentwicklern folgend, mit inline
 *  Kommentaren
 *
 *  Author: Marcus Reiche
 */

//  Initialisieren der Webapp
var adminApp = angular.module('adminApp', ['ngRoute','ngSanitize']);

//  Das Routing der Webapp definieren (Home / create / edit) Controller & Views zuweisen
adminApp.config(['$routeProvider', function(routeProvider) {
    routeProvider.
    when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    }).
    when('/create', {
        templateUrl: 'views/create.html',
        controller: 'CreateCtrl'
    }).
    when('/edit/:plantName', {
        templateUrl: 'views/create.html',
        controller: 'EditCtrl'
    }).
    otherwise({
        //Redirect zur Homepage falls der Nutzer unpassende URLS eingibt (404)
        redirectTo: '/'
    });
}]);

//  Der Controller für die Hauptseite, login und co wird serverseitig verarbeitet
adminApp.controller('MainCtrl', ['$scope', '$http', '$route', function(scope, http, route) {
    // Ajax Request um alle Pflanzen aus der Datenbank zu laden
    http({
        method: 'GET',
        url: '/api/allplants',
        cache: false
    }).success(function(data) {
        // Daten des Ajax Requests an das Scope übergeben
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

    // Action für den Delete Button, welche den Popup füllt und die Delete Aktion vorbereitet
    scope.askDelete = function(name) {
        scope.popupTitle = 'Bist du dir sicher?';
        scope.popupText  = 'Willst du wirklich '+name+' löschen? Diese Änderung ist unwiderruflich!';
        scope.popupButtonTitle = name+' löschen';
        scope.popupAction = name;
        jQuery('.modal').show();
    }

    // Action wenn man das löschen bestätigt
    scope.delete = function(name) {
        // Ajax Request DELETE um eine Pflanze zu löschen
        http.delete('/api/plant?name='+name).success(function(data) {
            // Seite wird neu geladen
            route.reload();
        });
    }
}]);

// Der Controller für die Pflanzen erstellen Seite
adminApp.controller('CreateCtrl', ['$scope', '$http', '$location', function(scope, http, location) {
    scope.action = 'Pflanze erstellen';
    // Ajax Request um die Krankheitsliste zu laden
    http({
        method: 'GET',
        url: '/api/allillness',
        cache: false
    }).success(function(data) {
        // Antwort des Ajax Request an Scope übergeben
        scope.illnesses = data;
    });

    // Submit Action für die Form
    scope.submit = function() {
        // START Umwandlung der Tipp Eingaben in Json
        scope.tipps = new Array();
        var tippsname = [scope.tip1name, scope.tip2name, scope.tip3name, scope.tip4name, scope.tip5name];
        var tippsdesc = [scope.tip1desc, scope.tip2desc, scope.tip3desc, scope.tip4desc, scope.tip5desc];
        for(var i = 0; i < tippsname.length; i++) {
            if(typeof(tippsname[i]) != "undefined" && typeof(tippsdesc[i]) != "undefined") {
                scope.tipps.push({
                    'name': tippsname[i],
                    'text': tippsdesc[i]
                });
            }
        }
        // Ende Umwandlung der Tipp Eingaben in Json

        // START Umwandlung der Rezept Eingaben in Json
        scope.recipes = new Array();
        var recipename = [scope.recipe1name, scope.recipe2name, scope.recipe3name, scope.recipe4name, scope.recipe5name];
        var recipedesc = [scope.recipe1link, scope.recipe2link, scope.recipe3link, scope.recipe4link, scope.recipe5link];
        for(var i = 0; i < recipename.length; i++) {
            if(typeof(recipename[i]) != "undefined" && typeof(recipedesc[i]) != "undefined") {
                scope.recipes.push({
                    'name': recipename[i],
                    'text': recipedesc[i]
                });
            }
        }
        // ENDE Umwandlung der Rezept Eingaben in Json

        // Check ob alle Eingaben richtig sind
        if(checkForm(scope) == true){
            // Ajax Request POST um eine neue Pflanze zu erstellen
            http.post('/api/plant',  {
                // Übergeben werden alle Daten in Json Format
                'name'          : scope.name,
                'desc'          : scope.desc,
                'short_desc'    : scope.short_desc,
                'freeze'        : scope.freeze,
                'sun'           : scope.sun,
                'difficulty'    : scope.difficulty,
                'water'         : scope.water,
                'energy'        : scope.energy,
                'calories'      : scope.calories,
                'protein'       : scope.protein,
                'carbs'         : scope.carbs,
                'fat'           : scope.fat,
                'vitamins'      : scope.vitamins,
                'tipps'         : scope.tipps,
                'recipes'       : scope.recipes,
                'illnesss'      : scope.illnesss
            }).success(function(data) {
                // Wenn erfolgreich wird auf die Startseite weitergeleitet
                location.path( "/" );
            });
        } else {
            // Falls nicht alle Eingaben korrekt sind wird ein Alert ausgeführt
            scope.popupText = checkForm(scope);
            jQuery('.modal').show();
        }
    }
}]);

// Der Controller für die Pflanzen editieren Seite
adminApp.controller('EditCtrl', ['$scope', '$http', '$routeParams','$location', function(scope, http, routeParams, location) {
    scope.action = 'Pflanze speichern';
    // Ajax Request um die Krankheitsliste zu laden
    http({
        method: 'GET',
        url: '/api/allillness',
        cache: false
    }).success(function(data) {
        // Antwort des Ajax Request an Scope übergeben
        scope.illnesses = data;
        var ajaxRoute = '/api/plant?name='+routeParams.plantName;

        // Wenn die Krankheiten geladen sind wird ein Ajax GET Request für d ie Pflanze ausgeführt
        http({
            method: 'GET',
            url: ajaxRoute,
            cache: false
        }).success(function(data) {
            // START Request Daten dem Scope zuweisen
            scope.oldName       = data.name;
            scope.name          = data.name;
            scope.desc          = data.desc;
            scope.short_desc    = data.short_desc;
            scope.freeze        = data.freeze;
            scope.sun           = data.sun;
            scope.difficulty    = data.difficulty;
            scope.water         = data.water;
            scope.energy        = data.energy;
            scope.calories      = data.calories;
            scope.protein       = data.protein;
            scope.carbs         = data.carbs;
            scope.fat           = data.fat;
            scope.vitamins      = data.vitamins;
            scope.illnesss      = data.illnesss;
            if(typeof(data.tipps[0]) != "undefined") {
                scope.tip1name      = data.tipps[0].name;
                scope.tip1desc      = data.tipps[0].text;
            }
            if(typeof(data.tipps[1]) != "undefined") {
                scope.tip2name      = data.tipps[1].name;
                scope.tip2desc      = data.tipps[1].text;
            }
            if(typeof(data.tipps[2]) != "undefined") {
                scope.tip3name      = data.tipps[2].name;
                scope.tip3desc      = data.tipps[2].text;
            }
            if(typeof(data.tipps[3]) != "undefined") {
                scope.tip4name = data.tipps[3].name;
                scope.tip4desc = data.tipps[3].text;
            }
            if(typeof(data.tipps[4]) != "undefined") {
                scope.tip5name      = data.tipps[4].name;
                scope.tip5desc      = data.tipps[4].text;
            }
            if(typeof(data.recipes[0]) != "undefined") {
                scope.recipe1name   = data.recipes[0].name;
                scope.recipe1link   = data.recipes[0].link;
            }
            if(typeof(data.recipes[1]) != "undefined") {
                scope.recipe2name   = data.recipes[1].name;
                scope.recipe2link   = data.recipes[1].link;
            }
            if(typeof(data.recipes[2]) != "undefined") {
                scope.recipe3name   = data.recipes[2].name;
                scope.recipe3link   = data.recipes[2].link;
            }
            if(typeof(data.recipes[3]) != "undefined") {
                scope.recipe4name   = data.recipes[3].name;
                scope.recipe4link   = data.recipes[3].link;
            }
            if(typeof(data.recipes[4]) != "undefined") {
                scope.recipe5name   = data.recipes[4].name;
                scope.recipe5link   = data.recipes[4].link;
            }
            // ENDE Request Daten dem Scope zuweisen
        });
    });

    //Submit Action für die Form
    scope.submit = function() {
        // START Umwandlung der Tipp Eingaben in Json
        scope.tipps = new Array();
        var tippsname = [scope.tip1name, scope.tip2name, scope.tip3name, scope.tip4name, scope.tip5name];
        var tippsdesc = [scope.tip1desc, scope.tip2desc, scope.tip3desc, scope.tip4desc, scope.tip5desc];
        for(var i = 0; i < tippsname.length; i++) {
            if(typeof(tippsname[i]) != "undefined" && typeof(tippsdesc[i]) != "undefined") {
                scope.tipps.push({
                    'name': tippsname[i],
                    'text': tippsdesc[i]
                });
            }
        }
        // Ende Umwandlung der Tipp Eingaben in Json

        // START Umwandlung der Rezept Eingaben in Json
        scope.recipes = new Array();
        var recipename = [scope.recipe1name, scope.recipe2name, scope.recipe3name, scope.recipe4name, scope.recipe5name];
        var recipedesc = [scope.recipe1link, scope.recipe2link, scope.recipe3link, scope.recipe4link, scope.recipe5link];
        for(var i = 0; i < recipename.length; i++) {
            if(typeof(recipename[i]) != "undefined" && typeof(recipedesc[i]) != "undefined") {
                scope.recipes.push({
                    'name': recipename[i],
                    'link': recipedesc[i]
                });
            }
        }
        // Ende Umwandlung der Rezept Eingaben in Json

        // Check ob alle Eingaben richtig sind
        if(checkForm(scope) == true){
            // AJAX PUT Request um das bearbeitete Objekt an die Datenbank zu übergeben
            http.put('/api/plant',  {
                'oldName'       : scope.oldName,
                'name'          : scope.name,
                'desc'          : scope.desc,
                'short_desc'    : scope.short_desc,
                'freeze'        : scope.freeze,
                'sun'           : scope.sun,
                'difficulty'    : scope.difficulty,
                'water'         : scope.water,
                'energy'        : scope.energy,
                'calories'      : scope.calories,
                'protein'       : scope.protein,
                'carbs'         : scope.carbs,
                'fat'           : scope.fat,
                'vitamins'      : scope.vitamins,
                'tipps'         : scope.tipps,
                'recipes'       : scope.recipes,
                'illnesss'      : scope.illnesss
            }).success(function(data) {
                // Wenn erfolgreich wird auf die Startseite weitergeleitet
                location.path( "/" );
            });
        } else {
            // Falls nicht alle Eingaben Korrekt sind wird ein Alert ausgeführt
            scope.popupText = checkForm(scope);
            jQuery('.modal').show();
        }
    }
}]);


// Form Validierung, diese Überprüft die Form ob alle Eingaben richtig sind
// Return ist TRUE wenn alles korrekt ist oder eine Message falls Fehler gefunden worden
function checkForm(object) {
    var msg     = '';
    if(object.name == '' || typeof(object.name) == 'undefined') {
        msg = "Bitte gib einen Namen ein";
        return msg;
    }
    if(object.desc == '' || typeof(object.desc) == 'undefined') {
        msg = "Bitte gib einen Beschreibung ein";
        return msg;
    }
    if(object.short_desc == '' || typeof(object.short_desc) == 'undefined') {
        msg = "Bitte gib einen Kurzbeschreibung ein";
        return msg;
    }
    if(isNaN(object.energy) && typeof(object.energy) != 'undefined' ) {
        msg = "Brennwert bitte als Zahl angeben, mit PUNKT nicht Komma.";
        return msg;
    }
    if(isNaN(object.calories) && typeof(object.calories) != 'undefined' ) {
        msg = "Kalorien bitte als Zahl angeben, mit PUNKT nicht Komma.";
        return msg;
    }
    if(isNaN(object.protein) && typeof(object.protein) != 'undefined' ) {
        msg = "Proteine bitte als Zahl angeben, mit PUNKT nicht Komma.";
        return msg;
    }
    if(isNaN(object.carbs) && typeof(object.carbs) != 'undefined' ) {
        msg = "Kohlenhydrate bitte als Zahl angeben, mit PUNKT nicht Komma.";
        return msg;
    }
    if(isNaN(object.fat) && typeof(object.fat) != 'undefined' ) {
        msg = "Fett bitte als Zahl angeben, mit PUNKT nicht Komma.";
        return msg;
    }
    return true;

}
