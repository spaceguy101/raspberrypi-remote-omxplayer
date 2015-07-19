

var omx = require('omx-manager'),
    fs = require('fs'),
    readline = require('readline'),
    readChunk = require('read-chunk'),
    fileType = require('file-type'),
    colors = require('colors'),
    path  = require('path'),
    express  = require('express'),
    cp = require('child_process'),
    exec = cp.exec,
    app = express(),
    path = require('path'),
    config = require('./config.json');



var  mediaDir = config.MediaDirectory , songs = [] /*Playlist*/ , currentSong = 0,dispSongs = [] ,songDuration = [];


 exec('killall -s 9 omxplayer.bin');
 exec('pkill omxplayer');
//df -h | grep --color=never /dev/sdb  //Get Mounted USB device


/*
function getUsbDevice(){


	exec('df -h | grep --color=never /dev/sdb', function(error, stdout, stderr) {
	    stdout=stdout.replace(/.*?\%/i, '').trim();
			console.log(stdout);

	});

}
*/


/*
var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
    console.log( dir.red + ' folder created. Plz add Songs to the folder... and restart application'.red);
    process.exit(0);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
};

mkdirSync(dir);
*/

mediaDir.forEach(function(dir){

  if(dir[dir.length-1] !== '/')  scanDirectory(dir+'/') ;
  else  scanDirectory(dir) ;

	});



function scanDirectory(dir){
var files;
	try{
	 files = fs.readdirSync(dir); // Read all files
	}catch(e){
		if(e.code === 'ENOENT'){
			console.log('ERR:'.red + dir.red + ' doesnt exist! Plz Enter correct path to MusicDirectory in config.json'.red);
			process.exit(1);
		}
	}

	console.log('\n Searching Song in '.green  + dir.yellow + ' folder... \n'.green);

	for(var j=0,len= files.length;j<len;j++){

			files[j] = dir+files[j];
			var validateIfMp3 = isMp3(files[j]);

    	if(validateIfMp3) {// Push if file is MP3
    		songs.push(files[j]);
    		dispSongs.push(files[j].replace(dir,'').replace('.mp3',''));
    		}
		}

}

function isMp3(mp3Src) { //Validate mp3 file
	if(/.mp3/.test(mp3Src)){

	var buffer = readChunk.sync(mp3Src, 0, 262);
	try {
			return fileType(buffer).ext === 'mp3';
		}catch(e){
			return false;
		}

	}else return false;
}


console.log(' ' + songs.length.toString().yellow + ' Songs Found : \n'.green);

displayPlaylist();


function displayPlaylist(){

	var j=1;
	dispSongs.forEach(function(song){
		console.log( j.toString().red + ' : ' + song.yellow );
		j++;
	});
}

var getSongDuration = function  (song, callback) {

  exec('omxplayer -i ' + '"' +song + '"', function (err, stdout, stderr) {
    if (!err) {
      var duration = /(Duration:\s)([\d.:]+)/g.exec(stderr);
      if (duration) {
        var durationArray = duration[2].split(':');
        var miliseconds = Math.ceil(durationArray[0]) * 60 * 60 * 1000 + Math.ceil(+durationArray[1]) * 60 * 1000 + durationArray[2] * 1000;
        callback(miliseconds);
      } else {
        // couldn't find duration for some reason
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

console.log('Setting up Playlist in order.. Please wait...'.red);

setDuration(0);

function setDuration(a){

	if(a < songs.length){
			getSongDuration ( songs[a], function(msec){
			songDuration[a]=msec -1000;
			setDuration(a+1);
		});
	}else console.log('Finished :)'.red);
}


function continuosPlaybackHandler(){

		if(songDuration[currentSong]){
			timeOuts.push(setTimeout(function(){
					if(currentSong < songs.length -1) playSong(currentSong+1,function(a){});
					else playSong(0,function(a){});
					console.log('timoutstop');
				},songDuration[currentSong]));

			console.log('Timeoutset ' + songDuration[currentSong]);
			clearExtraTimeOuts();
		}else console.log('ERR : Duration of song not found');

}


function clearExtraTimeOuts(){

	if(timeOuts.length > 1){

		clearTimeout(timeOuts.shift());

		console.log('extracleared');

		clearExtraTimeOuts();
  }else return;

	}



omx.stop();
var timeOuts = []; // To handle Timeout intervals at end of song


function playSong (i,callback) { // Play song of index currentSong from songs[]

	if(timeOuts[0]) {
		clearTimeout(timeOuts.pop());
		console.log('cleared');
	}

	if(currentSong<0 || currentSong>songs.length-1 ) {
		console.log('ERR: Plz enter valid song number'.red);
		callback(false);
	}else{
		currentSong = i;
	}

	if(omx.isLoaded() || omx.isPlaying()) {
		omx.stop() ;
	}
	else {
		omx.play(songs[currentSong]);
		console.log('Now Playing: '.red + dispSongs[currentSong].yellow);

		continuosPlaybackHandler();

	}


	omx.once('songended', function(){

		omx.play(songs[currentSong]);
		continuosPlaybackHandler();

		console.log('end');
		console.log('Now Playing: '.red + dispSongs[currentSong].yellow);


	});

 callback(true);


}



///////// Command Line options////////

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){


if(line == 'stop') stop();

else if(line == 'resume') resume();

else if(line == 'pause') pause();

else if(line.indexOf('play')>-1) play(line);

else if(line.indexOf('setVolume')>-1) {
	line = line.replace('setVolume','');
	try{
		setVolume(parseInt(line));
	}catch(e){

	}
}

else if(line == 'next') next();

else if(line == 'prev') next();

else if(line == 'stopApp') stopApp();

else if(line == 'list') {
	displayPlaylist();
}

else if(line.indexOf('seek')>-1) {
	line = line.replace('seek','');
	try{
		seek(parseInt(line));
	}catch(e){

	}
}

else console.log('ERR : Wrong command...'.red + '\nCommands: play [songNumber] , pause ,resume , next , stopApp , stop, setVolume [percent] '.blue);

});

//*******************************//

function stop(){
	omx.stop();
}

function pause(){
	omx.pause();
}


function resume(){
	omx.play();
}

function play(line){


	line = line.replace('play','');
	if(line) {
		try {

			playSong(parseInt(line) - 1,function(a){});
			//currentSong =parseInt(line) - 1 ;
		}catch(e){

			console.log('ERR : play argument should be INT'.red);
			playSong(0,function(a){});
		}
	}else playSong(0,function(a){});

}

function prev(){


	if(currentSong > 0) {
		playSong(currentSong-1,function(a){});

	}else{
		playSong(songs.length -1,function(a){});

	}


}

function next(){


	if(currentSong < songs.length -1 ) playSong(currentSong+1,function(a){});
	else playSong(0,function(a){});

}


function stopApp(){
	process.exit(0);
}

function setVolume(volume){

}

function seek(sec){

}
/////////////// Express ////////////


 app.use(express.static(__dirname + '/public'));


    app.listen(8080);


    app.get('/play/:song_no', function(req, res) {


    	playSong(req.params.song_no - 1,function(a){
        if(a) res.send(JSON.stringify({'song':currentSong+1 , 'action':'play'}));
            else res.send(JSON.stringify({'song':currentSong+1 , 'action':'err'}));
      });

    });


    var pause1 = false;
    app.get('/pause', function(req, res) {

     	if(pause1) {
        pause1 = false;
        resume();
      }else {
        pause1 = true;
        pause();
      }

     	res.send(JSON.stringify({'song':currentSong+1 , 'action':'pause'}));
    });



    app.get('/stop', function(req, res) {
     	stop();
     	res.send(JSON.stringify({'song':currentSong+1 , 'action':'stop'}));
    });

var currentVol;
    app.get('/setvolume/:vol', function(req, res) {
     	  setVolume(req.params.vol);
     	   res.send(JSON.stringify({'song':currentSong+1 , 'action':'setvolume'}));
     	   currentVol = req.params.vol;
    });


    app.get('/playlist', function(req, res) {

     	res.send(JSON.stringify(dispSongs));
    });

    app.get('/getcurrentsong', function(req, res) {

     	res.send(JSON.stringify({'song':currentSong+1 , 'action':'null'}));
    });

    app.get('/refresh', function(req, res) {
        omx.stop();
        exec('killall -s 9 omxplayer.bin',function (error, stdout, stderr) {
          if (error !== null) {
            console.log('exec error: ' + error);
          }

          playSong(currentSong,function(a){});

            res.send(JSON.stringify({'song':currentSong+1 , 'action':'refresh'}));
          });
        });
