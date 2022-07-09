var {typesEnum, typesList} = require("../schemas/types/types.js")
var { getAverageColor } = require('fast-average-color-node');
const axios = require('axios');


 function deltaE(rgbA, rgbB) {
    let labA = rgb2lab(rgbA);
    let labB = rgb2lab(rgbB);
    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
  }
  
 function rgb2lab(rgb){
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
  }


async function getType(imageUrl) {
  const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
  var colorObject = await getAverageColor(res.data);
  var colorArray = colorObject.rgb;
  var parsedColorArray = colorArray.replace("rgb(", "").replace(")", "").split(",").map(x => parseInt(x));
  
  // default to fire type 
  var closestType = typesList[0];
  // typesList[0];
  if (parsedColorArray != null){
    var minDelta = 1000000;
    for (var i = 0; i<typesList.length; i++){
      // console.log(typesList[i]);
      var delta = deltaE(parsedColorArray, typesList[i].rgb);
      if (delta <= minDelta){
        closestType = typesList[i];
        minDelta = delta;
      }
    }
    // console.log("closestType");
    // console.log(closestType);
    return closestType;
  } else {
    console.log("COLOR ARRAY IS NULL")
  }
}


module.exports = {deltaE, rgb2lab, getType }
