angular.module('myApp', ['ui.router', 'ui.bootstrap']);

angular.module('myApp').config(function ($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('home', {
    url: '',
    views: {
      "main" : {
        templateUrl:'home.html',
        controller:'HomeCtrl'
      }
    }
  })
})

angular.module('myApp').run(function ($window, $rootScope) {
  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  $window.checkLoginState = function () {
    FB.getLoginStatus(function(response) {
      $rootScope.$broadcast('facebookStatusChange', response);
    });
  }
})

angular.module('myApp').controller('HomeCtrl', function ($scope, $timeout, $http) {
  $scope.history = [1,2,3];
  $scope.gotoPriorSlide = function () {
    newSlide = $scope.history.pop();
    $scope.activateSlide(newSlide, false);
  }
  $scope.slides = [
    {
      template:'templates/arrival.html',
      active: true
    },
    {
      template:'templates/lengthStay.html',
      active: false
    },
    {
      template:'templates/departing.html',
      active: false
    },
    {
      template:'templates/amountPeople.html',
      active: false
    },
    {
      template:'templates/couple.html',
      active: false
    },
    {
      template:'templates/addingToDatabase.html',
      active: false
    },
    {
      template:'templates/informationAdded.html',
      active: false
    },
    {
      template:'templates/userAdded.html',
      active: false
    }
  ]
  $scope.formVariables = {
    arrivalOpened: false,
    departureOpened: false,
    arrivalMinDate: new Date(),
    departureMinDate: new Date()
  }
  $scope.data = {
    arrivalDate: undefined,
    departureDate: undefined
  };
  $scope.submitArrivalDate = function () {
    //var m = moment($scope.data.arrivalDate,'dd-MMMM-yyyy');
    if ($scope.data.arrivalDate !== undefined) {
      $scope.formVariables.departureMinDate = $scope.data.arrivalDate;
      $scope.activateSlide(1, true);
    } else {
      $scope.dateError = 'Please enter a valid date using the date picker.';
    }
  }
  $scope.submitDepartureDate = function () {
    var m = moment($scope.data.departureDate,'dd-MMMM-yyyy');
    if (m.isValid()) {
      $scope.activateSlide(3, true);
    } else {
      $scope.dateError = 'Please enter a valid date using the date picker.';
    }
  }
  $scope.$watchGroup(['data.arrivalDate','data.departureDate'], function () {
    $scope.dateError = '';
  })

  $scope.$on('facebookStatusChange', function (e, response) {
    if (response.status === 'connected') {
      FB.api('/me', function(data) {
        var user = {
          fbId: data.id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          gender: data.gender,
        };
        $http({
          method:'POST',
          url:'https://findaplacemaltaapi.herokuapp.com/users',
          params: {
            'placeRequest': $scope.placeRequest._id
          },
          data: user
        }).then(function(data, status, headers, config) {
          $scope.user = data.data;
          $scope.activateSlide(7, false);
        }, function (data, status, headers, config) {
          alert('Something went wrong there...');
        })
      });
    }
  })
  $scope.activateSlide = function (slide, recordIntoHistory) {
    $scope.slides.forEach(function(s,i){
      if (s.active && recordIntoHistory) {
        $scope.history.push(i);
      }
      s.active = (slide == i);
    })
    if (slide == 5) {
      $scope.history = [];
      $http({
        method:'POST',
        data:$scope.data,
        url:'https://findaplacemaltaapi.herokuapp.com/placeRequest'
      }).then(function (data, status, headers, config) {
        $scope.placeRequest = data.data;
        $scope.activateSlide(6, false);
      }, function (data, status, headers, config) {
        console.log(status);
      })
    }
  }
  $scope.open = function($event,key) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.formVariables[key] = true;
  };
});
