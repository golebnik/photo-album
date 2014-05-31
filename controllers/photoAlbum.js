angular.module("photoAlbum")
    .constant("photoIndexUrl", "/Albums/index.json")
    .controller("photoAlbumCtrl", function ($scope, $http, $location, $routeParams, $sce,
        $anchorScroll, photoIndexUrl, $window) {

        $scope.data = {};

        $http.get(photoIndexUrl)
            .success(function (data) {
                $scope.data.index = data;
                $scope.album_index = data;
                console.log($scope.album_index);
            })
            .error(function (error) {
                $scope.data.error = error;
            });

        $scope.album_name = $routeParams.albumName;

        if ($scope.album_name) {
            $scope.photo_list = $scope.album_index[$scope.album_name];
        }

        $scope.selected_photo_name = "";

        $scope.select_photo = function ($event, index) {
            $scope.selected_index = index;
            $scope.set_photo_url();
        };

        $scope.sanitize = function (name) {
            return name.replace(/\.jpg$/, '').replace(/ - \d+$/, '').replace(/ - /g, " &ndash; ")
                .replace('Utka', 'Katherine').replace('Utki', 'Howard');
        };

        $scope.photo_link = function (number, name) {
            return $sce.trustAsHtml((number + 1) + ".&ensp;" + $scope.sanitize(name));
        };

        $scope.$on('keyDown', function (event) {
            alert("key");
        });

//        $scope.set_photo_url = function () {
//            $scope.selected_photo_name = $scope.album_index[$scope.album_name][$scope.selected_index];
//            $scope.selected_photo_url = "http://pigeonhouse.com/Photos/" + $scope.album_name + "/" + $scope.selected_photo_name;
//            $scope.selected_photo_url = $scope.selected_photo_url.replace(/ä/g, "ä").replace(/ü/g, "ü").replace(/ö/g, "ö")
//            console.log($scope.selected_photo_url);
//        };

        $scope.set_photo_url = function () {
            $scope.selected_photo_name = $scope.album_index[$scope.album_name][$scope.selected_index];
            $scope.selected_photo_url = "/Albums/" + $scope.album_name + "/" + $scope.selected_photo_name;
            $scope.selected_photo_url = $scope.selected_photo_url.replace(/ä/g, "ä").replace(/ü/g, "ü").replace(/ö/g, "ö")
            console.log($scope.selected_photo_url);
            $scope.photo_loaded = false;
            $http({
                method: 'GET',
                url: $scope.selected_photo_url,
                headers: {'Content-Type': 'image/jpeg'}
            })
                .success(function (data) {
//                    $scope.binary_photo_data = Base64.encode(data);
//                    $scope.img_enclosing_binary_data = "<img src='data:image/jpeg;base64," + btoa(data) + "'/>";
                    $scope.photo_loaded = true;
                })
                .error(function (error) {
                    $scope.data.error = error;
                });

        };

        $scope.scroll_to_selected = function() {
            var scrollX = window.pageXOffset;
            var scrollY = window.pageYOffset;
            var elem = document.getElementById("photo_" + $scope.selected_index);
            document.getElementById("photo_" + $scope.selected_index).scrollIntoView(true);

            console.log("scrollX = " + scrollX + ", scrollY = " + scrollY);
            console.log("offsetTop = " + elem.offsetTop + "; innerHeight = " + window.innerHeight);
            var new_y = elem.offsetTop - window.innerHeight / 2;
            window.scrollTo(0, new_y);
            console.log("scrolling to " + new_y);
        };

        $scope.select_first_photo = function () {
            $scope.selected_index = 0;
            $scope.set_photo_url();
            $scope.scroll_to_selected();
//            document.getElementById("photo_" + $scope.selected_index).scrollIntoView(true);
        };

        $scope.select_prev_photo = function () {
            $scope.selected_index--;
            $scope.set_photo_url();
            $scope.scroll_to_selected();
//            document.getElementById("photo_" + $scope.selected_index).scrollIntoView(true);
        };

        $scope.select_next_photo = function () {
            $scope.selected_index++;
            $scope.set_photo_url();
            $scope.scroll_to_selected();
//            document.getElementById("photo_" + $scope.selected_index).scrollIntoView(false);
        };

        $scope.handle_key_event = function (event) {
            if ((event.keyCode == 37 || event.keyCode == 38) && $scope.selected_index > 0) {
                $scope.select_prev_photo();
            }
            else if ((event.keyCode == 39 || event.keyCode == 40) && $scope.selected_index < $scope.photo_list.length - 1) {
                $scope.select_next_photo();
            }
        };

        $scope.scroll_to_top = function() {
            $anchorScroll("top");
            $scope.select_first_photo();
        };

    })

    // Thanks to Ben Nadel (http://www.bennadel.com/blog/2422-capturing-document-click-events-with-angularjs.htm)
    //   for the 'bnDocumentClick' directive, which has been amended here to capture key presses

    // Define our document-click directive. This will evaluate the
    // given expression on the containing scope when the click
    // event is triggered.
    .directive(
        "bnDocumentClick",
        function( $document, $parse ) {

            // I connect the Angular context to the DOM events.
            var linkFunction = function ($scope, $element, $attributes) {

                // Get the expression we want to evaluate on the
                // scope when the document is clicked.
                var scopeExpression = $attributes.bnDocumentClick;

                // Compile the scope expression so that we can
                // explicitly invoke it with a map of local
                // variables. We need this to pass-through the
                // click event.
                //
                // NOTE: I ** think ** this is similar to
                // JavaScript's apply() method, except using a
                // set of named variables instead of an array.
                var invoker = $parse(scopeExpression);

                // Bind to the document click event.
                $document.on(
                    "keydown",
                    function (event) {
                        if (event.keyCode >= 37 && event.keyCode <= 40) {

                            // When the click event is fired, we need
                            // to invoke the AngularJS context again.
                            // As such, let's use the $apply() to make
                            // sure the $digest() method is called
                            // behind the scenes.
                            $scope.$apply(
                                function () {

                                    // Invoke the handler on the scope,
                                    // mapping the jQuery event to the
                                    // $event object.
                                    invoker(
                                        $scope,
                                        {
                                            $event: event
                                        }
                                    );

                                }
                            );
                        }
                    }
                );

                // TODO: Listen for "$destroy" event to remove
                // the event binding when the parent controller
                // is removed from the rendered document.

            };

            // Return the linking function.
            return( linkFunction );

        })

        // Got this nugget from http://stackoverflow.com/questions/17884399/image-loaded-event-in-for-ng-src-in-angularjs
        .directive('imageonload', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    element.bind('load', function() {
                        ;
                    });
                }
            };
        });
