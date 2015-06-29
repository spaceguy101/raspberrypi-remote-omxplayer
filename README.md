#raspberrypi-remote-omxplayer
##Control Omxplayer on Raspberry pi remotely via Web Interface
* Make sure you have installed Omxplayer on RPi.
```
sudo apt-get install omxplayer
```
* Clone this repository
```
git clone https://github.com/singham007/raspberrypi-remote-omxplayer.git
```
* Change Directory to repository 
```
cd raspberrypi-remote-omxplayer
```
* Open config.json and Enter your Music Directory where songs are stored .
```
{
	"MusicDirectory":""
}
```
* Run by -
```
node player.js
```
