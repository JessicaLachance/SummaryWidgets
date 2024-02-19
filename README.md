SummaryWidgets is a series of [HTML widgets](http://www.htmlwidgets.org) which works with
[Crosstalk](https://rstudio.github.io/crosstalk/index.html) and Flexdashboard to display a single
summary statistic in a variety of forms. Options include an html text span, a gauge and a valuebox.

This package acts as an extensions of existing work. The html text span build on the work of [Ken Johnson's summarywidget](https://kent37.github.io/summarywidget). The gauge and valuebox are inspired by Flexdashboard, though implemented differently. 

All three widgets serve the same purpose, update one aggregated statistic when the Crosstalk selection changes. These widgets support the following aggregations: count, sum, mean and percent_total (given a selection of the data).

These widgets also support formatting numbers according to a custom locale, and support has been added to customize currency display, percent sign display, unit display, different notation and sign display.


