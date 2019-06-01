
# WxBeacon2

Get Environment Data from WxBeacon2(OMRON 2JCIE-BL01), output to InfluxDB.
(Output data is an average of the past 60 seconds.)

## Installation

```bash
$ # Make  Database
$ curl -i -XPOST http://[HOST]:[PORT]/query --data-urlencode "q=CREATE DATABASE [DBNAME]"
$ git clone https://github.com/iedred7584/WxBeacon2.git
$ cd WxBeacon2
$ # Edit lines 1, 2 and 3 at main.js.
$ npm i noble
$ node main.js
```
