HTMLWidgets.widget({
  name: 'summaryValueBox',
  type: 'output',

  factory: function (el, width, height) {

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

    return {
      renderValue: function (x) {

        var color_thresholds = x.color_thresholds;

        var config = new Object();

        x.settings.locale = (x.settings.locale === "navigator.language") ? navigator.language : x.settings.locale;
        config.lang = x.settings.locale.split("-")[0].toLowerCase();
        if(["de","en","es","fr","it","nl","ru"].includes(config.lang)){
          config.desc = vbAltText[config.lang]["value"];
        } else {
          config.desc = "";
        }

        if(x.title){
          if(x.title.charAt(x.title.length-1) != "."){
            config.title = x.title.concat(".");
          } else {
            config.title = x.title;
          }
        } else if (x.caption) {
          if((x.caption).charAt((x.caption).length-1) != "."){
            config.title = x.caption.concat(".");
          } else {
            config.title = x.caption;
          }
        }
        else {
          config.title = "";
        }

        color_thresholds = convert_inf(color_thresholds);

        let bgColourScale;
        let textColourScale;
        let iconColourScale;

         if(window.matchMedia('(forced-colors: active)').matches) {

          bgColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(["AccentColor"]);

          textColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(["CanvasText"]);

          iconColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(["CanvasText"]);

         } else{

          bgColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(color_thresholds.range);

          textColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(color_thresholds.text_range);

          iconColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(color_thresholds.icon_range);
         }

        let nodeID = el.id

        let svg = d3.select(`#${nodeID}`)
          .attr("width", width)
          .attr("height", height)
          .append("svg")
          .attr("role", "img")
          .attr("aria-describedby", `${nodeID}-title ${nodeID}-desc`)
          .attr("aria-live","off");

        svg.select("svg");

        svg.append("title")
          .attr("id", `${nodeID}-title`)
          .text(config.title);

         svg.append("desc")
          .attr("id", `${nodeID}-desc`);

        let svg_rect = svg.append("rect")
          .style("width", "100%")
          .style("height", "100%")
          .style("fill", "white")
          .style('filter', 'none');

        if (x.icon) {

          let icon_svg = svg.append("path")
            .attr("d", $.parseHTML(x.icon)[0].firstChild.getAttribute("d"))
            .style("fill", "white")

          let svg_bb = svg_rect.node().getBBox();
          let icon_bb = 16;
          let scale_factor = 5;
          let v_transpose = (svg_bb.height - (icon_bb * scale_factor)) / 2;
          let h_transpose = svg_bb.width - (icon_bb * scale_factor) - 10;

          icon_svg.attr("transform", `translate(${h_transpose},${v_transpose}) scale(${scale_factor} ${scale_factor})`)
        }

        svg.append("text")
          .attr('class', "value-text")
          .attr("font-size", x.settings.number_format === "unit" ? "26px" : "30px")
          .attr("text-anchor", "start")
          .attr("dominant-baseline", "central")
          .attr("dx", "5%")
          .attr("dy", "50%")
          .style('filter', 'none')
          .style("font-weight", "bold");

        if (x.caption) {
          svg.selectAll(".caption-text")
            .data([x.caption])
            .enter().append("text")
            .attr('class', "caption-text")
            .attr("font-size", "14px")
            .attr("text-anchor", "start")
            .style("font-weight", "bold")
            .attr("dx", "5%")
            .attr("dy", "72%")
            .style("fill", "white")
            .text(d => d)
            .call(wrap, width * 0.8);
        }

        // Make a data object with keys so we can easily update the selection
        var data = {};
        var i;
        if (x.settings.crosstalk_key === null) {
          for (i = 0; i < x.data.length; i++) {
            data[i] = x.data[i];
          }
        } else {
          for (i = 0; i < x.settings.crosstalk_key.length; i++) {
            data[x.settings.crosstalk_key[i]] = x.data[i];
          }
        }

        // Update the display to show the values in d
        var update = function (d, n,callback) {

          let [value, value_format] = calculateSingleValues(d, n, x)


          svg.select(`#${nodeID}-desc`)
            .text(x.desc ?? config.desc.concat(
              (value_format ?? "NA"),
              "."
            ));

          svg.select("rect")
            .transition()
            .duration(1000)
            .style('filter', 'none')
            .style("fill", bgColourScale(value));

          svg.select(".value-text")
            .text(value_format ?? "NA")
            .transition()
            .duration(1000)
            .style('filter', 'none')
            .style("fill", textColourScale(value));

          if (x.caption) {
            svg.select(".caption-text")
            .data([x.caption])
            .join(function (enter) {
              return enter.append("text")
              .text(d => d)
              .attr('class', "caption-text")
              .attr("font-size", "14px")
              .attr("text-anchor", "start")
              .style("font-weight", "bold")
              .attr("dx", "5%")
              .attr("dy", "72%")
              .style("fill", "white")
              },
              function (update) {
                return update.text(d => d)
              })
            .call(wrap, width * 0.80)
            .transition()
            .duration(1000)
            .style("fill", textColourScale(value))
          }

          if (x.icon) {
            svg.select("path")
              .transition()
              .duration(1000)
              .style("fill", iconColourScale(value));
          }
        };

        // Set up to receive crosstalk filter and selection events
        var ct_filter = new crosstalk.FilterHandle();
        ct_filter.setGroup(x.settings.crosstalk_group);
        ct_filter.on("change", function (e) {
          if (e.value) {
            update(filterKeys(data, e.value), x.numerator);
          } else {
            update(data, x.numerator);
          }
          toggleAriaHidden(`#${nodeID}`);
        });

        var ct_sel = new crosstalk.SelectionHandle();
        ct_sel.setGroup(x.settings.crosstalk_group);
        ct_sel.on("change", function (e) {
          if (e.value && e.value.length) {
            update(filterKeys(data, e.value), x.numerator,x.callback);
          } else {
            update(data, x.numerator, x.callback);
          }
          toggleAriaHidden(`#${nodeID}`);
        });

        // Make adjustments if high contrast mode is on
       window.matchMedia('(forced-colors: active)').addEventListener('change', event => {
         if(event.matches) {

          bgColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(["AccentColor"]);

          textColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(["CanvasText"]);

          iconColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(["CanvasText"]);

         } else{

          bgColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(color_thresholds.range);

          textColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(color_thresholds.text_range);

          iconColourScale = d3.scaleThreshold()
            .domain(color_thresholds.domain)
            .range(color_thresholds.icon_range);
         }
          update(data,x.numerator);
       });

        update(data, x.numerator);
      },

      resize: function (width, height) {

        let resize_svg = d3.select(`#${el.id}`)
          .attr("width", width)
          .attr("height", height)
          .select("svg")
          .attr("width", width)
          .attr("height", height)

        let resize_rect = resize_svg.select("rect")
          .attr("width", width)
          .attr("height", height)

        let icon = resize_svg.select("path")

        if (!icon.empty()) {
          let svg_bb = resize_rect.node().getBBox();
          let icon_bb = 16;
          let scale_factor = 5;
          let v_transpose = (svg_bb.height - (icon_bb * scale_factor)) / 2;
          let h_transpose = svg_bb.width - (icon_bb * scale_factor) - 10;

          icon
            .attr("transform", `translate(${h_transpose},${v_transpose}) scale(${scale_factor} ${scale_factor})`)
        }
        resize_svg.selectAll(".caption-text")
          .call(wrap, width * 0.94)
      }

    };
  }
});
