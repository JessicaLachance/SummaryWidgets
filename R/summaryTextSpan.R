#' Show a single value in a text span
#'
#' A `summaryTextSpan` displays a single value derived from a linked table.
#' Its primary use is with the `crosstalk` package. Used with `crosstalk`,
#' a `summaryTextSpan` displays a value which updates as the data selection
#' changes.
#'
#' @param data Data to summarize, normally an instance of [crosstalk::SharedData].
#' @param statistic The aggregation to perform.
#' Possible vales are `c("count","first", "last", "min","max","mode", "concatenate", "unique")`.
#' `first`, `last` and `concatenate` will select the value based on the index of the column passed to the function.
#' `min` and `max` will selected the value based on either d3.ascending (default) or through the function passed to the parameter `sort`
#' Count is the default.
#' @param column For most statistics, the column of `data` to summarize.
#' Not used for `"count"`.
#' @param selection Optional parameter. Expression to select a fixed subset of `data`. May be a logical vector or a one-sided formula that evaluates to a logical vector.
#' If used, the `key` given to [crosstalk::SharedData] must be a fixed column (not row numbers).
#' @param locale Optional parameter. For `count` and `unqiue` control how the number is displayed. Valid strings include
#' a [IETF BCP 47 language tag](https://en.wikipedia.org/wiki/IETF_language_tag),
#' @param delim Optional parameter. For concatenate, choose the joining string. Default is `", "`
#' @param sort Optional parameter. A sort function used to sort the data to determine the min or max value or the order in which to concatenate the value.
#' @param width Optional parameter. Fixed width for widget (in css units), which is passed to htmlwidgets::createWidget.
#' @param height Optional parameter. Fixed height for widget (in css units), which is passed to htmlwidgets::createWidget.
#' @param elementId Optional parameter. String used to define the element containing the widget, which is passed to htmlwidgets::createWidget.
#'
#' @import crosstalk
#' @import htmlwidgets
#'
#' @export
summaryTextSpan <- function(data,
                            statistic = c("count","first", "last", "min","max","mode", "concatenate","unique"),
                            column = NULL,
                            selection = NULL,
                            locale = "navigator.language",
                            delim = ", ",
                            sort = NULL,
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
  sort <- match.arg(sort)

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


  # We just need one column, either the row.names or the specified column.
  if (is.null(column)) {
    if (!statistic != "count") {
      stop("Column must be provided with ", statistic, " statistic.")
    }
    data <- row.names(data)
  } else {
    if (!(column %in% colnames(data))) {
      stop("No ", column, " column in data.")
    }
    data <- data[[column]]
  }

  # forward options using x
  x <- list(
    data = data,
    settings = list(
      statistic = statistic,
      locale = locale,
      delim = delim,
      sort = sort,
      crosstalk_key = key,
      crosstalk_group = group
    )
  )

  # create widget
  htmlwidgets::createWidget(
    name = "summaryTextSpan",
    x,
    width = width,
    height = height,
    package = "SummaryWidgets",
    elementId = elementId,
    dependencies = crosstalk::crosstalkLibs()
  )
}

#' Shiny bindings for summaryTextSpan
#'
#' Output and render functions for using summaryTextSpan within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a summaryTextSpan
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name summaryTextSpan-shiny
#'
#' @export
summaryTextSpanOutput <- function(outputId, width = "100%", height = "100px") {
  htmlwidgets::shinyWidgetOutput(
    outputId,
    "summaryTextSpan",
    width,
    height,
    package = "summaryWidgets"
  )
}

#' @rdname summaryTextSpan-shiny
#' @export
renderSummaryTextSpan <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) {
    expr <- substitute(expr)
  } # force quoted
  htmlwidgets::shinyRenderWidget(expr, summaryTextSpanOutput, env, quoted = TRUE)
}

# Use a <span> container rather than the default <div>
summaryTextSpan_html <- function(id, style, class, ...) {
  htmltools::tags$span(id = id, class = class, .noWS = c("outside"))
}
