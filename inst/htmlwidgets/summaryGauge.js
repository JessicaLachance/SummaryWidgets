HTMLWidgets.widget({
  name: 'summaryGauge',
  type: 'output',

  factory: function (el, width, height) {
    var v_offset = 20;
    var convert_inf = function(x) {
      x.domain = (Array.isArray(x.domain)) ? x.domain : [x.domain]
      x.domain = x.domain.map(function(x){
                  switch(x) {
                    case "Number.NEGATIVE_INFINITY":
                      return -Infinity;
                    case "Number.POSITIVE_INFINITY":
                      return Infinity;
                    default:
                      return Number(x);  // Return the value unchanged if it's not an infinity
                  }
      })
      return x;
    };

    return {
      renderValue: function (x) {

        var targetPercent = function (min, max, value) {
          return (value - min) / (max - min);
        }

        var calculateGaugeValues = function (data, config) {

          col_length = data.length;

          let value;
          let min;
          let max;

          switch (config.settings.statistic) {
            case 'count':
              value = col_length;
              min = config.min ?? 0;
              max = config.max ?? col_length + 1;
              break;
            case 'sum':
              value = d3.sum(Object.values(data)) ?? "NA";
              min = config.min ?? d3.min(Object.values(data)) * col_length;
              max = config.max ?? d3.max(Object.values(data)) * col_length;
              break;
            case 'mean':
              value = d3.mean(Object.values(data)) ?? "NA";
              min = config.min ?? d3.min(Object.values(data));
              max = config.max ?? d3.max(Object.values(data));
              break;
            case 'pct_total':
              let num_length = config.numerator.length;
              value = data.length === 0 ? "NA" : num_length / data.length;
              min = config.min ?? 0;
              max = config.max ?? 1;
              break;
            case 'sum_pct_total':
              let num = d3.sum(Object.values(config.numerator));
              let denom = d3.sum(Object.values(data));
              value = num / denom ?? "NA";
              min = config.min ?? 0;
              max = config.max ?? 1;
              break;
            case 'min':
              value = d3.min(Object.values(data)) ?? "NA";
              min = config.min ?? 0;
              max = config.max ?? 1;
              break;
            case 'max':
              value = d3.max(Object.values(data)) ?? "NA";
              min = config.min ?? 0;
              max = config.max ?? 1;
              break;
            case 'quantile':
              value = d3.quantile(Object.values(data), config.settings.quantile) ?? "NA";
              min = d3.quantile(Object.values(data), 0) ?? 0;
              max = d3.quantile(Object.values(data), 1) ?? 1;
              break;
            case "sum_ratio":
              let tp = d3.sum(Object.values(data));
              let btm = d3.sum(Object.values(config.column2));
              value = tp / btm ?? "NA";
              min = config.min ?? 0;
              max = config.max ?? 1;
              break;
            case "wt_mean":
              let wt_sum = d3.sum(Object.keys(data).map(key => (data[key] ?? 0) * (config.weight[key] ?? 0)));
              let wt = d3.sum(Object.values(config.weight), d =>d);
              value = (wt_sum === null || wt === null) ? "NA" : (wt_sum / wt);
              value = (isNaN(value) || !isFinite(value)) ? "NA" : value;
              min = config.min ?? 0;
              max = config.max ?? 1;
          }

          return [value, min, max];
        }

        var getValueFootnote = function (value, min, max, locale) {
          let value_footnote = "";
          if (value < min) {
            switch (locale.substring(0, 2)) {
              case "en":
                value_footnote = "NOTE: Target value is less than the minimum value"
                break;
              case "fr":
                value_footnote = "NOTE : La valeur ciblée est inférieure à la valeur minimale."
                break;
              default:
                value_footnote = "NOTE: Target value is less than the minimum value"
                break;
            };
          } else if (value > max) {
            switch (locale.substring(0, 2)) {
              case "en":
                value_footnote = "NOTE: Target value exceeds the maximum value";
                break;
              case "fr":
                value_footnote = "NOTE : La valeur ciblée est supérieure à la valeur maximale."
                break;
              default:
                value_footnote = "NOTE: Target value exceeds the maximum value";
                break;
            };
          }
          return value_footnote
        }

        /**
        * Draws a gauge, with the number in the center, and the min and max value underneath
        * @param {String} nodeID - The id of the containing div of the chart. This div must have the class svg-wrapper
        * @param {Array} data - An array of objects representing the data to be visualized
        * @param {Object} config - The gauge config object
        */
        var drawGauge = function (nodeID, data, config) {

          let [value, min, max] = calculateGaugeValues(data, config);

          let value_footnote = getValueFootnote(value, min, max, config.settings.locale);

          let value_f, min_f, max_f;

          switch (config.settings.number_format) {
            case 'percent':
              value_f = format_percent(value, config.settings);
              min_f = format_percent(min, config.settings);
              max_f = format_percent(max, config.settings);
              break;
            case "currency":
              value_f = format_currency(value, config.settings);
              min_f = format_currency(min, config.settings);
              max_f = format_currency(max, config.settings);
              break;
            case "unit":
              value_f = format_unit(value, config.settings);
              min_f = format_unit(min, config.settings);
              max_f = format_unit(max, config.settings);
              break;
            case "decimal":
              value_f = format_number(value, config.settings);
              min_f = format_number(min, config.settings);
              max_f = format_number(max, config.settings);
              break;
          }

          let svg = d3.select(`#${nodeID}`)
            .append("svg")
            .attr("width", config.containerWidth)
            .attr("height", config.containerHeight)
            .attr("role", "img")
            .attr("aria-labelledby",`${nodeID}-title ${nodeID}-desc`)
            .attr("aria-live","polite")
            .attr("preserveAspectRatio", "xMidYMin meet")
            .attr("viewBox", `0 0 ${config.viewbox.width}, ${config.viewbox.height}`);

          svg.append("title")
            .attr("id", `${nodeID}-title`)
            .text(config.title.concat("."));

          svg.append("desc")
            .attr("id", `${nodeID}-desc`)
            .text(x.desc ?? config.desc.concat(
              config.minText,
              min_f, ". ",
              config.maxText,
              max_f,". ",
              config.valueText,
              value_f, ". ",
              value_footnote
            ));

          let valuePct = targetPercent(min, max, value);
          valuePct = valuePct < 0 ? 0 : valuePct > 1 ? 1 : valuePct;
          let valueRadian = (valuePct * Math.PI) - (Math.PI / 2);

          let gaugeData = [
            { startAngle: -Math.PI / 2, endAngle: valueRadian, fill: config.colourScale(valuePct) },
            { startAngle: valueRadian, endAngle: Math.PI / 2, fill: "#EDEDED" },
          ];

          let svgGauge = svg.append("g")
            .attr("transform",
              `translate(${(config.chartWidth / 2)},${config.chartHeight / 2 + config.margin.top})`);

          svgGauge.append("g")
            .attr("class", "slice-group")
            .selectAll(".slices")
            .data(gaugeData)
            .enter()
            .append("path")
            .attr("class", "slices")
            .attr("d", d3.arc()
              .outerRadius(config.outerRadius)
              .innerRadius(config.innerRadius)
            )
            .style("stroke", function (d) { return d.fill })
            .style("fill", function (d) { return d.fill });

          svgGauge.selectAll(".value-text")
            .data([value_f]).enter()
            .append("text")
            .attr('class', "value-text")
            .attr("font-size", "18px")
            .attr("text-anchor", "middle")
            .style("fill", config.mainText)
            .text(d => d)
            .call(shrink, config.innerRadius * 2);

          svgGauge.selectAll(".min-text")
            .data([min_f]).enter()
            .append("text")
            .attr('class', "min-text")
            .attr("font-size", "12px")
            .attr("text-anchor", "end")
            .attr("transform",
              `translate(${-(gaugeConfig.innerRadius)},${config.margin.top})`)
            .style("fill", config.noteText)
            .text(d => d);

          svgGauge.selectAll(".max-text")
            .data([max_f]).enter()
            .append("text")
            .attr('class', "max-text")
            .attr("font-size", "12px")
            .attr("text-anchor", "start")
            .attr("transform",
              `translate(${(gaugeConfig.innerRadius)},${config.margin.top})`)
            .style("fill", config.noteText)
            .text(d => d);

          svgGauge.selectAll(".ftn-text")
            .data([value_footnote]).enter()
            .append("text")
            .attr('class', "ftn-text")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .attr("transform",
              `translate(${0},${config.margin.top + 8})`)
            .style("fill", config.noteText)
            .text(d => d)
            .call(shrink, config.viewbox.width);
        }

        /**
         * Updates the gauge according to new data
         * @param {String} nodeID - The id of the containing div of the chart. This div must have the class svg-wrapper
         * @param {Array} data - An array of objects representing the data to be visualized
         * @param {Object} config - The pie chart config object
         */
        var updateGauge = function (nodeID, data, config) {

          let [value, min, max] = calculateGaugeValues(data, config);

          let value_footnote = getValueFootnote(value, min, max, config.settings.locale);

          let value_f, min_f, max_f;

          if (value !== "NA") {
            switch (config.settings.number_format) {
              case 'percent':
                value_f = format_percent(value, config.settings);
                min_f = format_percent(min, config.settings);
                max_f = format_percent(max, config.settings);
                break;
              case "currency":
                value_f = format_currency(value, config.settings);
                min_f = format_currency(min, config.settings);
                max_f = format_currency(max, config.settings);
                break;
              case "unit":
                value_f = format_unit(value, config.settings);
                min_f = format_unit(min, config.settings);
                max_f = format_unit(max, config.settings);
                break;
              case "decimal":
                value_f = format_number(value, config.settings);
                min_f = format_number(min, config.settings);
                max_f = format_number(max, config.settings);
                break;
            }
          }

          let svg = d3.select(`#${nodeID}`)
            .select("svg");

          svg.select("desc")
            .text(x.desc ?? config.desc.concat(
              config.minText,
              min_f, ". ",
              config.maxText,
              max_f, ". ",
              config.valueText,
              value_f, ". ",
              value_footnote
            ));

          let gaugeData;

          if (value !== "NA" && !isNaN(value)) {
            let valuePct = targetPercent(min, max, value);
            valuePct = valuePct < 0 ? 0 : valuePct > 1 ? 1 : valuePct;
            let valueRadian = (valuePct * Math.PI) - (Math.PI / 2);
          
            gaugeData = [
              { startAngle: -Math.PI / 2, endAngle: valueRadian, fill: config.colourScale(valuePct) },
              { startAngle: valueRadian, endAngle: Math.PI / 2, fill: "#EDEDED" },
            ];
          } else {
            gaugeData = [
              { startAngle: -Math.PI / 2, endAngle: -Math.PI / 2, fill: config.colourScale(-Infinity) },
              { startAngle: -Math.PI / 2, endAngle: Math.PI / 2, fill: "#EDEDED" },
            ];
          }
          

          let slices = svg.select(".slice-group").selectAll(".slices")
            .data(gaugeData)

          slices.exit().remove();

          slices = slices.merge(slices.enter().append("path"))

          slices.transition()
            .duration(config.transDur)
            .attr("class", "slices")
            .attrTween("d", function (d) {
              var interpolate = d3.interpolate(this._current, d);
              this._current = interpolate(0);
              return function (t) {
                return d3.arc()
                  .outerRadius(config.outerRadius)
                  .innerRadius(config.innerRadius)(interpolate(t));
              };
            })
            .style("stroke", function (d) { return d.fill })
            .style("fill", function (d) { return d.fill });


          svg.selectAll(".value-text")
            .data([value_f])
            .join(function (enter) {
              return enter.append("text")
                .attr("class", "value-text")
                .attr("font-size", "18px")
                .attr("text-anchor", "middle")
                .style("fill", config.mainText)
                .text(d => d)
                .call(shrink, config.innerRadius * 2);
            },
              function (update) {
                return update.text(d => d)
                  .attr("font-size", "18px")
                  .call(shrink, config.innerRadius * 2);

              })

          svg.select(".min-text")
            .data([min_f])
            .join(function (enter) {
              return enter.append("text")
                .attr("class", "min-text")
                .attr("font-size", "12px")
                .attr("text-anchor", "end")
                .attr("transform", `translate(${-(gaugeConfig.innerRadius)},${config.margin.top})`)
                .style("fill", config.noteText)
                .text(d => d)
            },
              function (update) {
                return update.text(d => d)
              })

          svg.select(".max-text")
            .data([max_f])
            .join(function (enter) {
              return enter.append("text")
                .attr("class", "max-text")
                .attr("font-size", "12px")
                .attr("text-anchor", "start")
                .attr("transform", `translate(${-(gaugeConfig.innerRadius)},${config.margin.top })`)
                .style("fill", config.noteText)
                .text(d => d)
            },
              function (update) {
                return update.text(d => d)
              })

          svg.selectAll(".ftn-text")
            .data([value_footnote])
            .join(function (enter) {
              return enter.append("text")
                .attr("class", "ftn-text")
                .attr("font-size", "9px")
                .attr("text-anchor", "middle")
                .attr("transform", `translate(${0},${config.margin.top + 8})`)
                .style("fill", config.noteText)
                .text(d => d)
                .call(shrink, config.viewbox.width);
            },
              function (update) {
                return update.text(d => d)
                .attr("font-size", "9px")
                .call(shrink, config.viewbox.width);
              })

        } // end updateGauge

        // Make a data object with keys so we can easily update the selection
        var data = createKeyedObject(x.data, x.settings.crosstalk_key);
        
        // Generate other variables only if needed
        var numerator = (["sum_pct_total","pct_total"].includes(x.settings.statistic)) ? 
          createKeyedObject(x.numerator, x.settings.crosstalk_key) : null;

        var column2 = (x.settings.statistic === "sum_ratio") ? 
          createKeyedObject(x.column2, x.settings.crosstalk_key) : null;
    
        var weight = (x.settings.statistic === "wt_mean") ? 
          createKeyedObject(x.weight, x.settings.crosstalk_key) : null;
        
        var color_thresholds = x.color_thresholds;
        color_thresholds = convert_inf(color_thresholds);

        if(height < (width/2)+v_offset){
            width = (height+v_offset)*2
        } else {
          height = Math.max((width/2)+v_offset,120)
        }

        d3.select(`#${el.id}`)
          .attr("width", width)
          .attr("height", height);

        let gaugeConfig = new Object();

        gaugeConfig.containerWidth = width;
        gaugeConfig.containerHeight = height;
        gaugeConfig.viewbox = { width: 200, height: 100+v_offset };
        gaugeConfig.margin = { top: 10, right: -5, bottom: -v_offset, left: -5 };
        gaugeConfig.chartWidth = gaugeConfig.viewbox.width - gaugeConfig.margin.left - gaugeConfig.margin.right;
        gaugeConfig.chartHeight = gaugeConfig.viewbox.height - gaugeConfig.margin.top - gaugeConfig.margin.bottom;
        gaugeConfig.outerRadius = Math.min(gaugeConfig.chartWidth, gaugeConfig.chartHeight) / 2;
        gaugeConfig.innerRadius = gaugeConfig.outerRadius * (0.6);   //innerRadius  = 0 gives a pie chart, 0 <innerRadius < outerRadius gives a donut chart
        gaugeConfig.transDur = 1000;
        gaugeConfig.settings = x.settings;
        gaugeConfig.settings.locale = (x.settings.locale === "navigator.language") ? navigator.language : x.settings.locale;
        gaugeConfig.settings.lang = gaugeConfig.settings.locale.split("-")[0].toLowerCase();

        if(x.title){
          if(x.title.charAt(x.title.length-1) !== "."){
            gaugeConfig.title = x.title.concat(".");
          } else {
            gaugeConfig.title = x.title;
          }
        } else {
          gaugeConfig.title = "";
        }

        if(["de","en","es","fr","it","nl","ru"].includes(gaugeConfig.settings.lang)){
          gaugeConfig.desc = gaugeAltText[gaugeConfig.settings.lang]["desc"];
          gaugeConfig.minText = gaugeAltText[gaugeConfig.settings.lang]["min"];
          gaugeConfig.maxText = gaugeAltText[gaugeConfig.settings.lang]["max"];
          gaugeConfig.valueText = gaugeAltText[gaugeConfig.settings.lang]["value"];
        } else {
          gaugeConfig.desc = "";
          gaugeConfig.minText = "";
          gaugeConfig.maxText = "";
          gaugeConfig.valueText = "";
        }
        gaugeConfig.colourScale;
        gaugeConfig.mainText;
        gaugeConfig.noteText;
        gaugeConfig.numerator = numerator;
        gaugeConfig.column2 = column2;
        gaugeConfig.weight = weight;
        gaugeConfig.min = x.min;
        gaugeConfig.max = x.max;

        if(window.matchMedia('(forced-colors: active)').matches) {
            gaugeConfig.colourScale = d3.scaleThreshold()
              .domain(x.color_thresholds.domain)
              .range(["AccentColor"]);

            gaugeConfig.noteText = "CanvasText";
            gaugeConfig.mainText = "CanvasText";

         } else{
            gaugeConfig.colourScale = d3.scaleThreshold()
              .domain(x.color_thresholds.domain)
              .range(x.color_thresholds.range);

            gaugeConfig.noteText = "#777";
            gaugeConfig.mainText = "black";
         }

        drawGauge(el.id, data, gaugeConfig);

        // Set up to receive crosstalk filter and selection events
        let ct_filter = new crosstalk.FilterHandle();
        ct_filter.setGroup(x.settings.crosstalk_group);
        ct_filter.on("change", function (e) {
          if (e.value) {

            gaugeConfig.numerator = numerator ? filterKeys(numerator, e.value) : null;
            gaugeConfig.column2 = column2 ? filterKeys(column2, e.value) : null ;
            gaugeConfig.weight = weight ? filterKeys(weight, e.value): null;

            updateGauge(el.id, filterKeys(data, e.value), gaugeConfig);
          } else {
            gaugeConfig.numerator = numerator;
            gaugeConfig.column2 = column2;
            gaugeConfig.weight = weight;
            updateGauge(el.id, data, gaugeConfig);
          }
        });

        let ct_sel = new crosstalk.SelectionHandle();
        ct_sel.setGroup(x.settings.crosstalk_group);

        ct_sel.on("change", function (e) {
          if (e.value) {
            gaugeConfig.numerator = numerator ? filterKeys(numerator, e.value) : null;
            gaugeConfig.column2 = column2 ? filterKeys(column2, e.value) : null ;
            gaugeConfig.weight = weight ? filterKeys(weight, e.value): null;
            updateGauge(el.id, filterKeys(data, e.value), gaugeConfig);
          } else {
            gaugeConfig.numerator = numerator;
            gaugeConfig.column2 = column2;
            gaugeConfig.weight = weight;
            updateGauge(el.id, data, gaugeConfig);
          }
        });

        window.matchMedia('(forced-colors: active)').addEventListener('change', event => {
         if(event.matches) {
            gaugeConfig.colourScale = d3.scaleThreshold()
              .domain(x.color_thresholds.domain)
              .range(["AccentColor"]);

            gaugeConfig.noteText = "CanvasText";
            gaugeConfig.mainText = "CanvasText";

         } else{

            gaugeConfig.colourScale = d3.scaleThreshold()
              .domain(x.color_thresholds.domain)
              .range(x.color_thresholds.range);

            gaugeConfig.noteText = "#777";
            gaugeConfig.mainText = "black";
         }
        updateGauge(el.id, data, gaugeConfig);
       });
      },

      resize: function (width, height) {

        if(height < (width/2)+v_offset){

          d3.select(`#${el.id} svg`)
            .attr("transform",
              `translate(${(width / 2)-(height+v_offset)},0)`);

          width = (height+v_offset)*2
        } else {
          d3.select(`#${el.id} svg`)
            .attr("transform",
              `translate(0,${(height / 2)-(Math.max((width/2)+v_offset,120)/2)})`);

          height = Math.max((width/2)+v_offset,120)
        }

        d3.select(`#${el.id} svg`)
            .attr("width", width)
            .attr("height", height)

        d3.select(`#${el.id}`)
          .attr("width", width)
          .attr("height", height);

      }

    };
  }
});
