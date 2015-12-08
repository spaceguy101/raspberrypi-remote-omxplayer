#raspberrypi-remote-omxplayer
##Control Omxplayer on Raspberry pi remotely via Web Interface
* Make sure you have installed Omxplayer on RPi.
```
sudo apt-get install omxplayer
```
* Clone this repository
```
git clone https://github.com/spaceguy101/raspberrypi-remote-omxplayer.git
```
* Change Directory to repository 
```
cd raspberrypi-remote-omxplayer
```
* Open config.json and Enter your Directory where your media is stored .
```
{
	"MusicDirectory":["/path/media/foo","/path/media/bar"]
}
```
* Run by -
```
node player.js
```
* Once the server has started,You can access the Web Interface at port `8080`
```
http://[hostname-raspberryPi]:8080
```
