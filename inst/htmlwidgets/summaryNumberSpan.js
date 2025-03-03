HTMLWidgets.widget({
  name: 'summaryNumberSpan',
  type: 'output',

  factory: function (el, width, height) {

    return {
      renderValue: function (x) {

        el.setAttribute('aria-live', 'off');

        x.settings.locale = (x.settings.locale === "navigator.language") ? navigator.language : x.settings.locale;

        // Make a data object with keys so we can easily update the selection
        var data = createKeyedObject(x.data, x.settings.crosstalk_key);
        
        // Generate other variables only if needed
        var numerator = (["sum_pct_total","pct_total"].includes(x.settings.statistic))? 
          createKeyedObject(x.numerator, x.settings.crosstalk_key) : null;

        var column2 = (x.settings.statistic === "sum_ratio") ? 
          createKeyedObject(x.column2, x.settings.crosstalk_key) : null;
    
        var weight = (x.settings.statistic === "wt_mean") ? 
          createKeyedObject(x.weight, x.settings.crosstalk_key) : null;

        // Update the display to show the values in d
        var update = function (d, n) {
          let [value, value_format] = calculateSingleValues(d, n, x);
          el.innerText = value_format;
        };

        // Set up to receive crosstalk filter and selection events
        var ct_filter = new crosstalk.FilterHandle();
        ct_filter.setGroup(x.settings.crosstalk_group);
        ct_filter.on("change", function (e) {
          if (e.value) {
            if(["sum_pct_total","pct_total"].includes(x.settings.statistic)){
              update(filterKeys(data, e.value), filterKeys(numerator,e.value));
            }else if(x.settings.statistic === "sum_ratio"){
              update(filterKeys(data, e.value), filterKeys(column2,e.value));
            } else if(x.settings.statistic === "wt_mean"){
              update(filterKeys(data, e.value), filterKeys(weight,e.value));
            } else{
              update(filterKeys(data, e.value));
            }

          } else {
            if(["sum_pct_total","pct_total"].includes(x.settings.statistic)){
              update(data, numerator);
            }else if(x.settings.statistic === "sum_ratio"){
              update(data, column2);
            } else if(x.settings.statistic === "wt_mean"){
              update(data, weight);
            } else{
              update(data);
            }
          }
        });

        var ct_sel = new crosstalk.SelectionHandle();
        ct_sel.setGroup(x.settings.crosstalk_group);
        ct_sel.on("change", function (e) {
          if (e.value && e.value.length) {
            if(["sum_pct_total","pct_total"].includes(x.settings.statistic)){
              update(filterKeys(data, e.value), filterKeys(numerator,e.value));
            }else if(x.settings.statistic === "sum_ratio"){
              update(filterKeys(data, e.value), filterKeys(column2,e.value));
            } else if(x.settings.statistic === "wt_mean"){
              update(filterKeys(data, e.value), filterKeys(x.weight,e.value));
            } else{
              update(filterKeys(data, e.value));
            }
          } else {
            if(["sum_pct_total","pct_total"].includes(x.settings.statistic)){
              update(data, numerator);
            }else if(x.settings.statistic === "sum_ratio"){
              update(data, column2);
            } else if(x.settings.statistic === "wt_mean"){
              update(data, weight);
            } else{
              update(data);
            }
          }
        });

        update(data, numerator);
      },

      resize: function (width, height) {

      }

    };
  }
});
