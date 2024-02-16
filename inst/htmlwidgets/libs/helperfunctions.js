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
  let values = [];
  for (var key in d) {
    if (d.hasOwnProperty(key)) { values.push(d[key]); }
  }
  let value = 0;
  let value_format = x.settings.statistic === "count" ? format_number(0, x.settings) : "NA";
  if (values.length) {
    switch (x.settings.statistic) {
      case 'count':
        value = values.length;
        break;
      case 'sum':
        value = values.reduce(function (acc, val) { return acc + val; }, 0);
        break;
      case 'mean':
        value = values.reduce(function (acc, val) { return acc + val; }, 0) / values.length;
        break;
      case 'pct_total':
        var num = n.filter(v => Object.keys(d).includes(v));
        value = num.length / values.length
        break;
      case 'sum_pct_total':
        var num = n.reduce(function (acc, val) { return acc + val; }, 0);
        var denom = values.reduce(function (acc, val) { return acc + val; }, 0);
        value = num / denom;
        break;
      case "min":
        value = values.reduce(function (acc, val) { return Math.min(acc, val); }, Infinity);
        break;
      case "max":
        value = values.reduce(function (acc, val) { return Math.max(acc, val); }, -Infinity);
        break;
      case "quantile":
        value = quantile(values, x.settings.quantile)
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
  return ([value, value_format])
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
