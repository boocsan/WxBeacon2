var InfluxDB_Server = "localhost"
var InfluxDB_Port = 8086
var InfluxDB_Database = "weather"



/***************************************************************************/



const execSync = require("child_process").execSync
const noble = require("noble")

var c = 0
var buffer = []

noble.on("stateChange", function () {
  noble.startScanning([], true)
})

noble.on("discover", function (peripheral) {
  var buf = peripheral.advertisement.manufacturerData
  if (typeof buf !== "undefined") {
    var res = buf.toString("hex")
    if (!res.startsWith("d502")) return

    var temp = EndianConverter(res[6] + res[7] + res[8] + res[9]) / 100
    var humi = EndianConverter(res[10] + res[11] + res[12] + res[13]) / 100
    var illumi = EndianConverter(res[14] + res[15] + res[16] + res[17])
    var uv = EndianConverter(res[18] + res[19] + res[20] + res[21]) / 100
    var pres = EndianConverter(res[22] + res[23] + res[24] + res[25]) / 10
    var noise = EndianConverter(res[26] + res[27] + res[28] + res[29]) / 100
    var bad = EndianConverter(res[30] + res[31] + res[32] + res[33]) / 100
    var heat = EndianConverter(res[34] + res[35] + res[36] + res[37]) / 100

    if (c == 60) {
      var t = 0,
        h = 0,
        i = 0,
        u = 0,
        p = 0,
        n = 0,
        b = 0,
        e = 0
      for (var _ = 0; _ < 60; _++) {
        t += buffer[_][0]
        h += buffer[_][1]
        i += buffer[_][2]
        u += buffer[_][3]
        p += buffer[_][4]
        n += buffer[_][5]
        b += buffer[_][6]
        e += buffer[_][7]
      }
      t /= 60
      h /= 60
      i /= 60
      u /= 60
      p /= 60
      n /= 60
      b /= 60
      e /= 60

      console.log(`AVG: ${t}c ${h}%RH ${i}lx ${u}(uv) ${p}hPa ${n}dB ${b}(bad) ${e}degC`)

      const result = execSync(`curl -si -XPOST "http://${InfluxDB_Server}:${InfluxDB_Port}/write?db=${InfluxDB_Database}&precision=s" --data-binary 'env,node=WxBeacon2_001 temperature=${t},humidity=${h},illuminance=${i},uv=${u},pressure=${p},noise=${n},bad=${b},heatstroke=${e}'`).toString().trim()

      c = 0
      buffer = []
    } else {
      buffer.push([temp, humi, illumi, uv, pres, noise, bad, heat])
      c++
    }
  }
})

function EndianConverter(v) {
  var len = v.length / 2
  var str = ""
  for (var i = 0; i < len; i++) {
    str += "" + v.substr((len - i - 1) * 2, 2)
  }
  return parseInt(str, 16)
}
