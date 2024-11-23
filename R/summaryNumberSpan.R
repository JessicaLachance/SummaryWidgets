#' Show a single summary statistic in a text span
#'
#' A `summaryNumberSpan` displays a single statistic derived from a linked table.
#' Its primary use is with the `crosstalk` package. Used with `crosstalk`,
#' a `summaryNumberSpan` displays a value which updates as the data selection
#' changes.
#'
#' @param data Data to summarize, normally an instance of [crosstalk::SharedData].
#' @param statistic The statistic to compute.
#' Possible vales are `c("count", "sum", "mean","pct_total", "min","max")`.
#' Count is the default.
#' @param column For most statistics, the column of `data` to summarize.
#' Not used for `"count"` or `"pct_total"` statistic.
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
#' @param quantile A number in `[0,1]`, specifying the quantile to use if statistic = "quantile".
#' The default number is 0.5 (i.e. median)
#' @param notation How the number should be displayed.
#' Possible vales are `c("standard", "scientific","engineering","compact")`.
#' Standard is the default.
#' @param width Optional parameter. Fixed width for widget (in css units), which is passed to htmlwidgets::createWidget.
#' @param height Optional parameter. Fixed height for widget (in css units), which is passed to htmlwidgets::createWidget.
#' @param elementId Optional parameter. String used to define the element containing the widget, which is passed to htmlwidgets::createWidget.
#'
#' @import crosstalk
#' @import htmlwidgets
#'
#' @export
summaryNumberSpan <- function(data,
                            statistic = c("count", "sum", "mean", "pct_total", "sum_pct_total", "min", "max", "quantile"),
                            column = NULL,
                            selection = NULL,
                            locale = "navigator.language",
                            digits = 0,
                            number_format = c("decimal", "percent", "currency", "unit"),
                            signDisplay = c("auto", "always", "exceptZero", "negative", "never"),
                            currency = NULL,
                            unit = NULL,
                            quantile = 0.5,
                            notation = c("standard", "scientific", "engineering", "compact"),
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
    key <- NULL
    group <- NULL
  }

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
    data <- row.names(data)
  } else {
    if (!(column %in% colnames(data))) {
      stop("No ", column, " column in data.")
    }
    data <- data[[column]]

    if (!is.null(numerator)){
      numerator <- numerator[[column]]
    }
  }

  # forward options using x
  x <- list(
    data = data,
    numerator = get0("numerator"),
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
    name = "summaryNumberSpan",
    x,
    width = width,
    height = height,
    package = "SummaryWidgets",
    elementId = elementId,
    dependencies = crosstalk::crosstalkLibs()
  )
}

#' Shiny bindings for summaryNumberSpan
#'
#' Output and render functions for using summaryNumberSpan within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a summaryNumberSpan
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name summaryNumberSpan-shiny
#'
#' @export
summaryNumberSpanOutput <- function(outputId, width = "100%", height = "100px") {
  htmlwidgets::shinyWidgetOutput(
    outputId,
    "summaryNumberSpan",
    width,
    height,
    package = "summaryWidgets"
  )
}

#' @rdname summaryNumberSpan-shiny
#' @export
rendersummaryNumberSpan <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) {
    expr <- substitute(expr)
  } # force quoted
  htmlwidgets::shinyRenderWidget(expr, summaryNumberSpanOutput, env, quoted = TRUE)
}

# Use a <span> container rather than the default <div>
summaryNumberSpan_html <- function(id, style, class, ...) {
  htmltools::tags$span(id = id, class = class,  .noWS = c("outside"))
}
