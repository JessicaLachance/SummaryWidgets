#' Create a crosstalk enabled gauge component for a dashboard.
#'
#' A gauge displays a numeric value on a meter that runs between
#' specified minimum and maximum values.
#'
#' @param data Data to summarize, normally an instance of [crosstalk::SharedData].
#' @param statistic The statistic to compute.
#' Possible vales are `c("count", "sum", "mean", "pct_total", "sum_pct_total", "min", "max", "quantile", "wt_mean","sum_ratio")`.
#' Count is the default.
#' @param column For most statistics, the column of `data` to summarize.
#' Not used for `"count"` or `"pct_total"` statistic.
#' @param column2 Valid only when `statistic = "sum_ratio"`. 
#' `column2` is a column of `data` such that `sum_ratio = sum(column)/sum(column2)` 
#' @param weight Valid only when `statistic = "wt_mean"`. 
#' Specifies the weight column of `data`.
#' @param selection Expression to select a fixed subset of `data`. May be
#' a logical vector or a one-sided formula that evaluates to a logical vector.
#' If used, the `key` given to [crosstalk::SharedData] must be a fixed column (not row numbers).
#' @param locale Control how the number is displayed. Valid strings include
#' a [IETF BCP 47 language tag](https://en.wikipedia.org/wiki/IETF_language_tag),
#' or the string "navigator.language". Default value is "navigator.language"
#' @param digits Number of decimal places to display, or NULL to display full precision.
#' if number_format == `"percent"`, digits == `0` the statistics is 0.1234,
#' the resulting visualization will show "12%".
#' @param number_format The resulting type of number to display.
#' Options are `c("decimal", "percent", "currency","unit")`. Decimal is the default.
#' @param signDisplay How to display the sign for the number. Possible values are:
#' `c("auto", "always","exceptZero","negative","never")`. Auto is the default
#' @param currency A string containing an ISO 4217 currency code. No default value.
#' [Full list is availble here](https://en.wikipedia.org/wiki/ISO_4217#List_of_ISO_4217_currency_codes)
#' NOTE: If this value is not null, number_format will be reassigned to `"currency"`
#' @param unit A string containing a valid unit identifier from [this list](https://tc39.es/ecma402/#table-sanctioned-single-unit-identifiers)
#' Pairs of simple units can be concatenated with "-per-" to make a compound unit.
#' NOTE: If this value is not null, number_format will be reassigned to `"unit"`
#' @param notation How the number should be displayed.
#' Possible vales are `c("standard", "scientific","engineering","compact")`.
#' Standard is the default.
#' @param quantile A number in `[0,1]`, specifying the quantile to use if statistic = "quantile".
#' The default number is 0.5 (i.e. median)
#' @param min Minimum numeric value to display alongside the calculated statistic.
#' By default, use 0 if statistic %in% c("count", "pct_total") and use the minimum value of the data otherwise.
#' @param max Maximum numeric value to display alongside the calculated statistic.
#' By default, use 1 if `statistic == "pct_total"`, `count` if `statistic == "count"`
#' and use the maximum value of the data otherwise.
#' @param color_thresholds a list containing two named vectors, domain and range.
#' The domain is a series of numbers and range is a series of colour strings (hex or html colour names) such that for a value x:
#'  - if `x < domain[1]` then `colour == range[1]`,
#'  - if `domain[1] <= x < domain[2]` then `colour == range[2]`
#'  - ...
#'  - if `domain[n-1] <= x < domain[n]` then `colour == range[n]`
#' - if `domain[n] <= x` then `colour == range[n+1]`
#'
#' As such, the length of the named vector range should be one item longer than the length of domain.
#' The default value for color_threshold is `list(domain = c(0.5,0.8), range = c("red","gold","mediumseagreen")`).
#' To fix a single colour, `let color_thresholds = list(domain = c(-Inf), range=c(unused_color,desired_color))`
#' @param width Optional parameter. Fixed width for widget (in css units), which is passed to htmlwidgets::createWidget.
#' @param height Optional parameter. Fixed height for widget (in css units), which is passed to htmlwidgets::createWidget.
#' @param elementId Optional parameter. String used to define the element containing the widget, which is passed to htmlwidgets::createWidget.
#'
#'
#' @import crosstalk
#' @import htmlwidgets
#' @import flexdashboard
#'
#' @export
summaryGauge <- function(data,
                         statistic = c("count", "sum", "mean", "pct_total", "sum_pct_total", "min", "max", "quantile", "wt_mean", "sum_ratio"),
                         column = NULL,
                         column2 = NULL,
                         weight = NULL,
                         selection = NULL,
                         locale = "navigator.language",
                         digits = 0,
                         number_format = c("decimal", "percent", "currency", "unit"),
                         signDisplay = c("auto", "always", "exceptZero", "negative", "never"),
                         currency = NULL,
                         unit = NULL,
                         quantile = 0.5,
                         notation = c("standard", "scientific", "engineering", "compact"),
                         min = NULL,
                         max = NULL,
                         color_thresholds = list(
                           domain = c(0.5, 0.8),
                           range = c("red", "gold", "mediumseagreen")
                         ),
                         accessible_title = NULL,
                         accessible_desc = NULL,
                         width = NULL,
                         height = NULL,
                         elementId = NULL) {
  if (crosstalk::is.SharedData(data)) {
    # Using Crosstalk
    key <- data$key()
    group <- data$groupName()
    data <- data$origData()
  } else {
    # Not using Crosstalk
    warning("SummaryWidgets works best when data is an instance of crosstalk::SharedData.")
    key <- row.names(data)
    group <- NULL
  }

    if (statistic == "sum_ratio" & is.null(column2)){
    stop("column2 cannot be null when statistic = sum_ratio")
  }

    if (statistic == "wt_mean" & is.null(weight)){
    stop("weight cannot be null when statistic = wt_mean")
  }

  if (!is.numeric(color_thresholds$domain)) {
    stop("color_thresholds domain must be a vector of numbers")
  }

  if (!is.null(get0("min")) && !is.numeric(min)) {
    stop("`min` must be a number or empty")
  }

  if (!is.null(get0("max")) && !is.numeric(max)) {
    stop("`max` must be a number or empty")
  }

  color_thresholds$domain <- sapply(
    color_thresholds$domain,
    function(x) {if (is.infinite(x)) {
      if (x < 0) {
        "Number.NEGATIVE_INFINITY"  # For -Inf
      } else {
        "Number.POSITIVE_INFINITY"  # For +Inf
      }
    } else {
      x  # Pass the value directly if it's not infinite
    }}
  )

  statistic <- match.arg(statistic)
  number_format <- match.arg(number_format)
  signDisplay <- match.arg(signDisplay)
  notation <- match.arg(notation)
  numerator <- NULL

  if (statistic %in% c("pct_total", "sum_pct_total")) {
    # If selection is given in the context of pct_total, apply selection to count rows in the numerator
    if (!is.null(selection)) {
      # Evaluate any formula
      if (inherits(selection, "formula")) {
        if (length(selection) != 2L) {
          stop("Unexpected two-sided formula: ", deparse(selection))
        }
        selection <- eval(selection[[2]], data, environment(selection))
      }
      if (!is.logical(selection)) {
        stop("Selection must contain TRUE/FALSE values.")
      }

      numerator <- data[selection, ]
      if (statistic == "pct_total") {
        numerator <- row.names(numerator)
      }
    } else {
      stop("When statistic is 'pct_total' or 'sum_pct_total', selection must be specified.")
    }
  } else {
    # If selection is given, apply it
    if (!is.null(selection)) {
      # Evaluate any formula
      if (inherits(selection, "formula")) {
        if (length(selection) != 2L) {
          stop("Unexpected two-sided formula: ", deparse(selection))
        }
        selection <- eval(selection[[2]], data, environment(selection))
      }
      if (!is.logical(selection)) {
        stop("Selection must contain TRUE/FALSE values.")
      }

      data <- data[selection, ]
      key <- key[selection]
    }
  }


  # We just need one column, either the row.names or the specified column.
  if (is.null(column)) {
    if (!statistic %in% c("count", "pct_total")) {
      stop("Column must be provided with ", statistic, " statistic.")
    }
    data_ <- row.names(data)
  } else {
    if (!(column %in% colnames(data))) {
      stop("No ", column, " column in data.")
    }
    data_ <- data[[column]]

    if (!is.null(numerator)){
      numerator <- numerator[[column]]
    }
  }

  if(!is.null(column2)){
    if (!(column2 %in% colnames(data))) {
      stop("No ", column2, " column in data.")
    }
    column2 <- data[[column2]]
  }

  if(!is.null(weight)){
    if (!(weight %in% colnames(data))) {
      stop("No ", weight, " column in data.")
    }
    weight <- data[[weight]]
  }

  # forward options using x
  x <- list(
    data = data_,
    numerator = get0("numerator"),
    column2 = get0("column2"),
    weight = get0("weight"),
    min = get0("min"),
    max = get0("max"),
    color_thresholds = color_thresholds,
    title = get0('accessible_title'),
    desc = get0('accessible_desc'),
    settings = list(
      statistic = statistic,
      locale = locale,
      digits = digits,
      crosstalk_key = key,
      crosstalk_group = group,
      number_format = ifelse(!is.null(unit),
        "unit",
        ifelse(!is.null(currency), "currency", number_format)
      ),
      signDisplay = signDisplay,
      currency = currency,
      unit = unit,
      quantile = quantile,
      notation = notation
    )
  )
  # create widget
  htmlwidgets::createWidget(
    name = "summaryGauge",
    x,
    width = width,
    height = height,
    package = "SummaryWidgets",
    elementId = elementId,
    dependencies = crosstalk::crosstalkLibs()
  )
}

#' Shiny bindings for summaryGauge
#'
#' Output and render functions for using gauge within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a gauge
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name summaryGauge-shiny
#'
#' @export
summaryGaugeOutput <- function(outputId, width = "100%", height = "100%") {
  htmlwidgets::shinyWidgetOutput(
    outputId,
    "summaryGauge",
    width,
    height,
    package = "SummaryWidgets"
  )
}

#' @rdname summaryGauge-shiny
#' @export
renderSummaryGauge <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) {
    expr <- substitute(expr)
  } # force quoted
  htmlwidgets::shinyRenderWidget(expr, summaryGaugeOutput, env, quoted = TRUE)
}
