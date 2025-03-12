function toggleAriaHidden(element_selector) {
    let element = document.querySelector(element_selector);
    element.setAttribute("aria-hidden", "true");
    requestAnimationFrame(() => {
        element.removeAttribute("aria-hidden");
    });
}

// Filter obj, returning a new obj containing only
// values with keys in keys.
var filterKeys = function (obj, keys) {
  var result = {};
  keys.forEach(function (k) {
    if (obj.hasOwnProperty(k))
      result[k] = obj[k];
  });
  return result;
};

function createKeyedObject(dataArray, keyArray) {
  dataArray = Array.isArray(dataArray) ? dataArray : [dataArray];
  keyArray = Array.isArray(keyArray) ? keyArray : [keyArray];
  let obj = {};
  
  if (keyArray === null) {
    // Use indices as keys if no crosstalk keys are provided
    dataArray.forEach((value, i) => obj[i] = value);
  } else {
    // Map crosstalk keys to data values
    keyArray.forEach((key, i) => obj[key] = dataArray[i]);
  }

  return obj;
}

var invertColor = function(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

var format_percent = function (v, x) {
  return v.toLocaleString(x.locale,
    {
      style: "percent",
      maximumFractionDigits: x.digits ?? 0,
      signDisplay: x.signDisplay ?? "auto"
    });
}

var format_currency = function (v, x) {
  return v.toLocaleString(x.locale,
    {
      style: "currency",
      currency: x.currency,
      maximumFractionDigits: x.digits ?? 0,
      currencyDisplay: "narrowSymbol",
      signDisplay: x.signDisplay ?? "auto"
    });
}

var format_unit = function (v, x) {
  return v.toLocaleString(x.locale,
    {
      style: "unit",
      unit: x.unit,
      maximumFractionDigits: x.digits ?? 0,
      notation: x.notation ?? "standard",
      signDisplay: x.signDisplay ?? "auto"
    });
}

var format_number = function (v, x) {
  return v.toLocaleString(x.locale,
    {
      style: "decimal",
      maximumFractionDigits: x.digits ?? 0,
      notation: x.notation ?? "standard",
      signDisplay: x.signDisplay ?? "auto"
    });
}

var quantile = function (arr, q) {
  const sorted = arr.sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

var calculateSingleValues = function (d, n, x) {
  d = Object.fromEntries(Object.entries(d).filter(([_, v]) => v !== undefined));
  n = n ? Object.fromEntries(Object.entries(n).filter(([_, v]) => v !== undefined)) : null;
  
  let value = 0;
  let value_format = x.settings.statistic === "count" ? format_number(0, x.settings) : "NA";

  let dValues = Object.values(d);  // Convert object to array
  let nValues = n ? Object.values(n) : [];  // Convert numerator object to array

  if (dValues.length) {
    switch (x.settings.statistic) {
      case 'count':
        value = dValues.length;
        break;
      case 'sum':
        value = d3.sum(dValues);
        break;
      case 'mean':
        value = d3.sum(dValues) / dValues.length;
        break;
      case 'pct_total':
        value = nValues.length / dValues.length;
        break;
      case 'sum_pct_total':
        let num = d3.sum(nValues);
        let denom = d3.sum(dValues);
        value = denom === 0 ? "NA" : num / denom;
        break;
      case "min":
        value = d3.min(dValues);
        break;
      case "max":
        value = d3.max(dValues);
        break;
      case "quantile":
        value = quantile(dValues, x.settings.quantile);
        break;
      case "sum_ratio":
        let tp = d3.sum(dValues);
        let btm = d3.sum(nValues);
        value = btm === 0 ? "NA" : tp / btm;
        break;
      case "wt_mean":
        if (Object.keys(d).length !== Object.keys(n).length) {
          throw new Error("Objects must have the same number of keys.");
        }
        let wt_sum = d3.sum(Object.keys(d).map(key => (d[key] ?? 0) * (n[key] ?? 0)));
        let wt = d3.sum(nValues);
        value = wt === 0 ? "NA" : wt_sum / wt;
        break;
    }

    switch (x.settings.number_format) {
      case 'percent':
        value_format = format_percent(value, x.settings);
        break;
      case "currency":
        value_format = format_currency(value, x.settings);
        break;
      case "unit":
        value_format = format_unit(value, x.settings);
        break;
      case "decimal":
        value_format = format_number(value, x.settings);
        break;
    }
  }
  
  return [value, value_format];
};


var calculateSingleText = function (d, n, x) {
  let values = [];
  for (var key in d) {
    if (d.hasOwnProperty(key)) { values.push(d[key]); }
  }
  let value = 0;
  if (values.length) {
    switch (x.settings.statistic) {
      case 'count':
        value = format_number(values.length,x);
        break;
      case 'first':
        value = values[0]
        break;
      case 'last':
        value = values[-1];
        break;
      case "min":
        value = values.sort(x.settings.sort ?? d3.ascending)[0];
        break;
      case "max":
        value = values.sort(x.settings.sort ?? d3.ascending)[-1];
        break;
      case "mode":
        value = d3.mode(values)
        break;
      case 'concatenate':
        value = values.join(x.settings.delim)
        break;
      case 'unique':
        let num = values.filter((v, idx) => arr.indexOf(v) === idx).length;
        value = format_number(num,x);
        break;
    }
  }
  return (value)
}

/**
 * Wraps the contents of a <text> element to a certain max width
 * If the data is of the form {key: "text", value: "value"} wrap will use data.key as the label
 * If there is no data.key, then wrap will use data as the label
 * Usage example:
 *     d3.select("text").call(wrap,100)
 * @param {selection} txt - A D3 selection of nodes, containing some data (i.e. desired labels)
 * @param {number} width - The max width in pixels before text should wrap
 * @param {function} accessor - Optional param. A function which can access the text to be wrapped from each element in the txt selection
 * @param {boolean} verticalCenter - Optional param. If true, then the dy values of the lines will be adjusted
 *                              so that the text block is vertically centered on the initial y value of the text node.
 *                              If false/undefines, then the first line will co-indcide with the initial y value with the text node
 *                              and subsequent lines will be underneath.
 * @return {null} Nothing
 */
function wrap(txt, width, accessor, verticalCenter) {

  txt.each(function () {
    var text = d3.select(this),
      textString = accessor ? accessor(text.datum()) : text.datum(),
      words = textString.split(/(?<=[\s\-])/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      x = text.attr("x") ?? 0,
      dx = text.attr("dx") ?? 0
    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);
    while (word = words.pop()) {
      line.push(word)
      tspan.text(line.join(""))
      if (tspan.node().getComputedTextLength() > width) {
        ++lineNumber
        line.pop()
        tspan.text(line.join(""))
        line = [word]
        tspan = text.append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dx", dx)
          .attr("dy", `${verticalCenter ? (lineHeight).toFixed(2) : lineHeight * lineNumber}em`)
          .text(word)

      }
    }
    if (lineNumber > 0 && verticalCenter) {
      text.select("tspan").attr("dy", function () {
        var dy0 = parseFloat(d3.select(this).attr("dy")) || 0;
        return `${(dy0 - (lineHeight / 2) * lineNumber).toFixed(2)}em`
      })
    }
  })
}

/**
 * Shrinks the contents of a <text> element to a certain max width
 * If the data is of the form {key: "text", value: "value"} wrap will use data.key as the label
 * If there is no data.key, then wrap will use data as the label
 * Usage example:
 *     d3.select("text").call(shrink,100)
 * @param {selection} txt - A D3 selection of nodes, containing some data (i.e. desired labels)
 * @param {number} width - The max width in pixels before text should wrap
 * @return {null} Nothing
 */
function shrink(txt, width) {

  txt.each(function () {
    var text = d3.select(this);
    var font_size = parseFloat(text.attr("font"));

    if (text.node().getComputedTextLength() > width) {
      do {
        font_size = (font_size > 10) ? (font_size - 1) : (font_size - 0.5);
        text.attr("font-size", font_size + "px");
      } while (text.node().getComputedTextLength() > width);
    };

  });
}

// The translations were made using https://bulktranslator.com/
let gaugeAltText = new Object();

gaugeAltText.de = {
  desc:"Dieses Diagramm visualisiert einen Schlüsselwert als Maß relativ zu einem Minimum und einem Maximum. ",
  min:"Der Mindestwert beträgt ",
  max:"Der Maximalwert beträgt ",
  value: "The key value is "
}
gaugeAltText.en = {
  desc:"This graph visualizes a key value as a gauge, relative to a minimum and a maximum value. ",
  min:"The minimum value is ",
  max:"The maximum value is ",
  value: "The key value is "
}

gaugeAltText.es = {
  desc:"Este gráfico visualiza un valor clave como indicador, en relación con un mínimo y un máximo. ",
  min:"El valor mínimo es ",
  max:"El valor máximo es ",
  value: "The key value is "
}

gaugeAltText.fr = {
  desc:"Ce graphique visualise une valeur clé sous forme de jauge, par rapport à un minimum et un maximum. ",
  min:"La valeur minimale est ",
  max:"La valeur maximale est ",
  value: "The key value is "
}

gaugeAltText.it = {
  desc:"Questo grafico visualizza un valore chiave come indicatore, relativo a un minimo e un massimo. ",
  min:"Il valore minimo è ",
  max:"Il valore massimo è ",
  value: "The key value is "
}

gaugeAltText.nl = {
  desc:"Deze grafiek visualiseert een sleutelwaarde als maatstaf, relatief ten opzichte van een minimum en een maximum",
  min:"De minimumwaarde bedraagt ",
  max:"De maximale waarde is ",
  value: "The key value is "
}

gaugeAltText.ru = {
  desc:"Этот график визуализирует ключевое значение в виде шкалы относительно минимума и максимума. ",
  min:"Минимальное значение — ",
  max:"Максимальное значение — ",
  value: "The key value is "
}



// The translations were made using https://bulktranslator.com/
let vbAltText = new Object();

vbAltText.de = {
  value: "Der Schlüsselwert ist ",
}

vbAltText.en = {
  value: "The key value is ",
}

vbAltText.es = {
  value: "El valor clave es ",
}

vbAltText.fr = {
  value: "La valeur clé est ",
}

vbAltText.it = {
  value: "Il valore chiave è ",
}

vbAltText.nl = {
  value: "De sleutelwaarde is ",
}

vbAltText.ru = {
  value: "Ключевое значение – ",
}


