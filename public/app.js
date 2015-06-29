'use strict';

(function(window) {

  var tunesApp = angular.module('App', []);

  tunesApp.controller('PlayerController', function($scope,$http) {


    $scope.currentSong = 1;
    $http.get('/playlist').success(function(data) {
      $scope.albums = data;

       $scope.play= function() {
       	$scope.currentSong = getSelection();

    	     $http.get('/play/'+$scope.currentSong).success(function(data) {
      	     console.log(data);
    	     });

      };

      $scope.pause= function() {
        $http.get('/pause').success(function(data) {
      	console.log(data);
    	});
      };

      $scope.stop= function() {
      $http.get('/play').success(function(data) {
      	console.log(data);
    	});
      };

       $scope.next= function() {


         if($scope.currentSong < $scope.albums.length) $scope.currentSong = $scope.currentSong + 1;
              else  $scope.currentSong = 1;

   			 $http.get('/play/'+$scope.currentSong).success(function(data) {
      		console.log(data);
          updatePlayer(data);
    	});
      };

       $scope.prev= function() {

       	if($scope.currentSong > 1 ) $scope.currentSong = $scope.currentSong -1;
        else $scope.currentSong = $scope.albums.length;

   		    $http.get('/play/'+$scope.currentSong).success(function(data) {
      	   	console.log(data);
            updatePlayer(data);
    	     });
    };

     $scope.setVolume= function(vol) {

         if(vol >= -1 || vol <= 100 )
           $http.get('/setvolume/'+vol).success(function(data) {
             console.log(data);
           });
         else return;
      };

       $scope.setCurrentSongAsServer= function() {

           $http.get('/getcurrentsong/').success(function(data) {

              $scope.currentSong = parseInt(data.song +1);

           });
      };

      $scope.refresh= function() {
      $http.get('/refresh').success(function(data) {
      	console.log(data);
    	});
      };


    });
  });


function getSelection(){
if($('input[name=radio1]:checked')[0]) return parseInt($('input[name=radio1]:checked')[0].attributes['value'].value);
else return 1 ;
}



function updatePlayer(data){

  $('input[value ='+ (data.song).toString()  + ']')[0].checked = true ;

}

})(window);
