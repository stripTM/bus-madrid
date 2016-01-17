#! /bin/sh
cd /media/creaciones/www/bus-madrid/app/
wget http://bus-madrid.localhost/?v=prod -O index.html
rm bus-madrid.zip
zip -r bus-madrid.zip index.html manifest.webapp js css style
