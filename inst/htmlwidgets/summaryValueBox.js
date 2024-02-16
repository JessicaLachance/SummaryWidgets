HTMLWidgets.widget({
  name: 'summaryValueBox',
  type: 'output',

  factory: function (el, width, height) {

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

        x.settings.locale = (x.settings.locale === "navigator.language") ? navigator.language : x.settings.locale;

        let bgColourScale = d3.scaleThreshold()
          .domain(typeof (x.color_thresholds.domain) === "number" ? [x.color_thresholds.domain] : x.color_thresholds.domain)
          .range(x.color_thresholds.range);

        let textColourScale = d3.scaleThreshold()
          .domain(typeof (x.color_text.domain) === "number" ? [x.color_text.domain] : x.color_text.domain)
          .range(x.color_text.range);

        let iconColourScale = d3.scaleThreshold()
          .domain(typeof (x.color_icon.domain) === "number" ? [x.color_icon.domain] : x.color_icon.domain)
          .range(x.color_icon.range);

        let nodeID = el.id

        let svg = d3.select(`#${nodeID}`)
          .attr("width", width)
          .attr("height", height)
          .append("svg")
          .attr("role", "img")
          .attr("aria-labelledby", `${nodeID}-title ${nodeID}-desc`);

        svg.select("svg");

        // svg.append("title")
        //   .attr("id", `${nodeID}-title`)
        //   .text(config.title);

        // svg.append("desc")
        //   .attr("id", `${nodeID}-desc`)
        //   .text(config.desc);

        let svg_rect = svg.append("rect")
          .style("width", "100%")
          .style("height", "100%")
          .style("fill", "white");

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
          .style("font-weight", "bold")
          .style("fill", "white")

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
            .call(wrap, width * 0.94);
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
        var update = function (d, n) {

          let [value, value_format] = calculateSingleValues(d, n, x)

          svg.select("rect").transition()
            .duration(1000)
            .style("fill", bgColourScale(value));

          svg.select(".value-text")
            .text(value_format ?? "NA")
            .transition()
            .duration(1000)
            .style("fill", textColourScale(value));

          if (x.caption) {
            svg.select(".caption-text")
              .transition()
              .duration(1000)
              .style("fill", textColourScale(value));
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
        });

        var ct_sel = new crosstalk.SelectionHandle();
        ct_sel.setGroup(x.settings.crosstalk_group);
        ct_sel.on("change", function (e) {
          if (e.value && e.value.length) {
            update(filterKeys(data, e.value), x.numerator);
          } else {
            update(data, x.numerator);
          }
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
