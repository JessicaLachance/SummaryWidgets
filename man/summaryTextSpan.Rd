% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/summaryTextSpan.R
\name{summaryTextSpan}
\alias{summaryTextSpan}
\title{Show a single summary statistic in a text span}
\usage{
summaryTextSpan(
  data,
  statistic = c("count", "sum", "mean", "pct_total", "sum_pct_total", "min", "max",
    "quantile"),
  column = NULL,
  selection = NULL,
  locale = "navigator.language",
  digits = 0,
  number_format = c("decimal", "percent", "currency", "unit"),
  signDisplay = c("auto", "always", "exceptZero", "negative", "never"),
  currency = NULL,
  unit = NULL,
  quantile = quantile,
  notation = c("standard", "scientific", "engineering", "compact"),
  width = NULL,
  height = NULL,
  elementId = NULL
)
}
\arguments{
\item{data}{Data to summarize, normally an instance of \link[crosstalk:SharedData]{crosstalk::SharedData}.}

\item{statistic}{The statistic to compute.
Possible vales are \code{c("count", "sum", "mean","pct_total", "min","max")}.
Count is the default.}

\item{column}{For most statistics, the column of \code{data} to summarize.
Not used for \code{"count"} or \code{"pct_total"} statistic.}

\item{selection}{Expression to select a fixed subset of \code{data}. May be
a logical vector or a one-sided formula that evaluates to a logical vector.
If used, the \code{key} given to \link[crosstalk:SharedData]{crosstalk::SharedData} must be a fixed column (not row numbers).}

\item{locale}{Control how the number is displayed. Valid strings include
a \href{https://en.wikipedia.org/wiki/IETF_language_tag}{IETF BCP 47 language tag},
or the string "navigator.language". Default value is "navigator.language"}

\item{digits}{Number of decimal places to display, or NULL to display full precision.
if number_format == \code{"percent"}, digits == \code{0} the statistics is 0.1234,
the resulting visualization will show "12\%".}

\item{number_format}{The resulting type of number to display.
Options are \code{c("decimal", "percent", "currency","unit")}. Decimal is the default.}

\item{signDisplay}{How to display the sign for the number. Possible values are:
\code{c("auto", "always","exceptZero","negative","never")}. Auto is the default}

\item{currency}{A string containing an ISO 4217 currency code. No default value.
\href{https://en.wikipedia.org/wiki/ISO_4217#List_of_ISO_4217_currency_codes}{Full list is availble here}
NOTE: If this value is not null, number_format will be reassigned to \code{"currency"}}

\item{unit}{A string containing a valid unit identifier from \href{https://tc39.es/ecma402/#table-sanctioned-single-unit-identifiers}{this list}
Pairs of simple units can be concatenated with "-per-" to make a compound unit.
NOTE: If this value is not null, number_format will be reassigned to \code{"unit"}}

\item{quantile}{A number in \verb{[0,1]}, specifying the quantile to use if statistic = "quantile".
The default number is 0.5 (i.e. median)}

\item{notation}{How the number should be displayed.
Possible vales are \code{c("standard", "scientific","engineering","compact")}.
Standard is the default.}

\item{width}{Optional parameter. Fixed width for widget (in css units), which is passed to htmlwidgets::createWidget.}

\item{height}{Optional parameter. Fixed height for widget (in css units), which is passed to htmlwidgets::createWidget.}

\item{elementId}{Optional parameter. String used to define the element containing the widget, which is passed to htmlwidgets::createWidget.}
}
\description{
A \code{summaryTextSpan} displays a single statistic derived from a linked table.
Its primary use is with the \code{crosstalk} package. Used with \code{crosstalk},
a \code{summaryTextSpan} displays a value which updates as the data selection
changes.
}
