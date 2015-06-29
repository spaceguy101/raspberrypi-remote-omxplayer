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
* Install by- ( Make sure you have [node](https://nodejs.org/) , [npm](https://docs.npmjs.com/getting-started/installing-node) & [bower] (http://bower.io/) installed.)
```
npm install
bower -g install
```
* Open config.json and Enter your Music Directory where songs are stored .
* Run by -
```
node player.js
```
