HTMLWidgets.widget({
  name: 'summaryTextSpan',
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

        el.setAttribute('aria-live', 'off');

        x.settings.locale = (x.settings.locale === "navigator.language") ? navigator.language : x.settings.locale;

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
          let value = calculateSingleText(d, n, x);
          el.innerText = value;
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

        // TODO: code to re-render the widget with a new size

      }
    };
  }
});
