

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
    app      = express(),
    path =require('path'),
    config=require('./config.json');



var playNext = true, songsDir = config.MusicDirectory, songs = []/*Playlist*/, currentSong = 0,dispSongs = [];



 exec('killall -9 omxplayer.bin');
//df -h | grep --color=never /dev/sdb  //Get Mounted USB device



function getUsbDevice(){


	exec('df -h | grep --color=never /dev/sdb', function(error, stdout, stderr) {
	    stdout=stdout.replace(/.*?\%/i, '').trim();
			console.log(stdout);

	});

}

/*
var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
    console.log( songsDir.red + ' folder created. Plz add Songs to the folder... and restart application'.red);
    process.exit(0);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
};

mkdirSync(songsDir);
*/

scanDirectory(songsDir);

function scanDirectory(songsDir){
var files;
	try{
	 files = fs.readdirSync(songsDir); // Read all files
	}catch(e){
		if(e.code === 'ENOENT'){
			console.log('ERR:'.red + songsDir.red + ' doesnt exist! Plz Enter correct path to MusicDirectory in config.json'.red);
			process.exit(1);
		}
	}

	console.log('\n Searching Song in '.green  + songsDir.yellow + ' folder... \n'.green);

	for(var j=0,len= files.length;j<len;j++){

			files[j] = songsDir+files[j];
			var validateIfMp3 = isMp3(files[j]);
    	//console.log(files[j] + " isMp3 ? : " + validateIfMp3);
    	if(validateIfMp3) songs.push(files[j]); // Push if file is MP3
		}

}

function isMp3(mp3Src) { //Validate mp3 file
	var buffer = readChunk.sync(mp3Src, 0, 262);
	try {
		return fileType(buffer).ext === 'mp3';
	}catch(e){
		return false;
	}
}


console.log(' ' + songs.length.toString().yellow + ' Songs Found : \n'.green);


	for(var k=0;k<songs.length;k++){
		dispSongs[k] = songs[k].replace(songsDir,'').replace('.mp3','');
		}

displayPlaylist();


function displayPlaylist(){

	var j=1;
	dispSongs.forEach(function(song){
		console.log( j.toString().red + ' : ' + song.yellow );
		j++;
	});
}


function playSong(i) { // Play song of index currentSong from songs[]


	if(currentSong<0 || currentSong>songs.length-1 ) {
		console.log('ERR: Plz enter valid song number'.red);
		return;
	}else{
		currentSong = i;
	}

	if(omx.isLoaded() || omx.isPlaying()) {
		omx.stop() ;
	}
	else {
		omx.play(songs[currentSong]);
		console.log('Now Playing: '.red + dispSongs[currentSong].yellow);
	}

	omx.once('stop', function(){

		omx.removeListener('end', function(){});
		if(playNext) {
			currentSong=currentSong+1;
			omx.play(songs[currentSong]);
		}
		else omx.play(songs[currentSong]);

		console.log('stop');
		console.log('Now Playing: '.red + dispSongs[currentSong].yellow);
		playNext=true;
    
	});

	omx.once('end', function(){
		omx.removeListener('stop', function(){});
		if(playNext) {
			currentSong=currentSong+1;
			omx.play(songs[currentSong]);
		}
		else omx.play(songs[currentSong]);

		console.log('end');
		console.log('Now Playing: '.red + dispSongs[currentSong].yellow);
		playNext=true;
    
	});


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

	playNext=false;
	line = line.replace('play','');
	if(line) {
		try {

			playSong(parseInt(line) - 1 );
			//currentSong =parseInt(line) - 1 ;
		}catch(e){

			console.log('ERR : play argument should be INT'.red);
			playSong(0);
		}
	}else playSong(0);

}

function prev(){

	playNext=false;
	if(currentSong > 0) {
		playSong(currentSong-1);

	}else{
		playSong(songs.length -1);

	}


}

function next(){
	playNext=false;

	if(currentSong < songs.length -1 ) playSong(currentSong+1);
	else playSong(0);

}


function stopApp(){
	process.exit(0);
}

function setVolume(volume){
var args = ['-D', 'pulse', 'sset','Master',volume+'%'],
childProc = cp.spawn('amixer', args);
setVolumerl = readline.createInterface({
            input: childProc.stdout,
            output:childProc.stdin
        });
}

function seek(sec){




}
/////////////// Express ////////////


 app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users


    app.listen(8080);
    console.log("App listening on port 8080");


    app.get('/play/:song_no', function(req, res) {

      function sync(plays,callback){
        playNext=false;
        plays;
        callback;
      }
      sync(
    	playSong(req.params.song_no - 1),
    	res.send(JSON.stringify({'song':currentSong+1 , 'action':'play'}))
          );

    });



    app.get('/pause', function(req, res) {
     	pause();
     	res.send(JSON.stringify({'song':currentSong+1 , 'action':'pause'}));
    });



    app.get('/stop', function(req, res) {
     	stop();
     	res.send(JSON.stringify({'song':currentSong+1 , 'action':'stop'}));
    });

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
        exec('killall -9 omxplayer.bin',function (error, stdout, stderr) {
          if (error !== null) {
            console.log('exec error: ' + error);
          }
            res.send(JSON.stringify({'song':currentSong+1 , 'action':'refresh'}));
          });
        });
