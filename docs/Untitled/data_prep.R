# Load external libraries
library(bslib)
library(crosstalk)
library(DT)
options(DT.locale = lang)
library(dplyr)
library(tidyr)
library(forcats)
library(htmltools)
library(scales)
library(SummaryWidgets)
library(jsonlite)

df_to_html_table <- function(df,col_names, caption) {
  # Create table header
  header <- tags$tr(
    lapply(col_names, function(x) { tags$th(x)})
  )

  # Create table body
  body <- lapply(1:nrow(df), function(i) {
    tags$tr(
      lapply(df[i, ], function(cell) {
        tags$td(cell)
      })
    )
  })

  # Combine header and body into the full table
  table <- tags$table(
    class="table table-striped",
    tags$caption(caption, class="caption-top"),
    tags$thead(header),
    tags$tbody(body)
  )

  # Return HTML content
  table
}

extract_text <- function(lang, text) {
  pattern <- if (lang == "en") {
    "^[^/]*"     # Matches everything before the first /
  } else {
    "(?<=/).*"   # Matches everything after the /
  }

  sapply(text, function(x) {
    if (grepl("/", x)) {
      regmatches(x, regexpr(pattern, x, perl = TRUE))
    } else {
      x # Use the entire string if there's no /
    }
  })
}

accessible_table <- function(caption_label,col_names){
  htmltools::withTags(
    table(
      tabindex = 0,
      `aria-labelledby` = caption_label,
      tableHeader(col_names)
    )
  )
}
# Prep HTML dependencies
wet_boew <- htmlDependency(
  name = "wet_boew",
  version = "1.0",
  src = c(file = "wet-boew/js"),
  script = "wet-boew.min.js"
)

GCWeb <-  htmlDependency(
  name = "GCWeb",
  version = "1.0",
  src = c(file = "GCWeb"),
  script = "js/theme.min.js",
  stylesheet = "css/theme.min.css"
)

bootstrap5_dep <- htmlDependency(
  name = "bootstrap",
  version = "5.3.0", # Specify the desired version of Bootstrap
  src = c(href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/"), # CDN source for Bootstrap 5
  stylesheet = "css/bootstrap.min.css", # Path to CSS file on CDN
  script = "js/bootstrap.bundle.min.js", # Path to JavaScript bundle on CDN
)

my_custom_jquery <- htmlDependency(
  name = "jquery",
  version = "2.2.4",
  src = c(href = "https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/"),
  script = "jquery.min.js"
)


vote_method <- read.csv(
  url("https://elections.ca/res/rep/off/ovr2021app/53/data_donnees/table_tableau05.csv"),
  col.names = c("Province",
                "stationary_poll_votes",
                "mobile_poll_votes",
                "advanced_poll_votes",
                "svr_votes",
                "total_valid_votes"
  )
) %>%
  mutate(Province = extract_text(lang,Province))

vote_method <- vote_method %>%
  bind_rows(vote_method %>%
              summarise(
                stationary_poll_votes = sum(stationary_poll_votes),
                mobile_poll_votes = sum(mobile_poll_votes),
                advanced_poll_votes = sum(advanced_poll_votes),
                svr_votes = sum(svr_votes),
                total_valid_votes = sum(total_valid_votes)
              ) %>%
              mutate(Province = "Canada",.before = 1)
  )

vote_method$Province <- as_factor(vote_method$Province)

electors_polls_site <- read.csv(
  url("https://www.elections.ca/res/rep/off/ovr2021app/53/data_donnees/table_tableau01.csv"),
  col.names = c("Province",
                "Population",
                "Electors",
                "stationary_polls",
                "mobile_polls",
                "advanced_polls",
                "total_polls"
  )
) %>%
  mutate(Province = extract_text(lang,Province))

electors_polls_site <- electors_polls_site %>%
  bind_rows(electors_polls_site %>%
              summarise(
                Population = sum(Population),
                Electors = sum(Electors),
                stationary_polls = sum(stationary_polls),
                mobile_polls = sum(mobile_polls),
                advanced_polls = sum(advanced_polls),
                total_polls = sum(total_polls)
              ) %>%
              mutate(Province = "Canada",.before = 1)
  )


electors_polls_site$Province <- as_factor(electors_polls_site$Province)

voter_turnout_hist <- read.csv(
  url("https://www.elections.ca/res/rep/off/ovr2021app/53/data_donnees/table_tableau04.csv"),
  col.names = c("Province",
                "elector_count_2021",
                "elector_count_2019",
                "elector_count_2015",
                "elector_count_2011",
                "ballots_cast_2021",
                "ballots_cast_2019",
                "ballots_cast_2015",
                "ballots_cast_2011",
                "turnout_2021",
                "turnout_2019",
                "turnout_2015",
                "turnout_2011"
  )
) %>%
  mutate(Province = extract_text(lang,Province),
         turnout_2021 = turnout_2021/100,
         turnout_2019 = turnout_2019/100,
         turnout_2015 = turnout_2015/100,
         turnout_2011 = turnout_2011/100)

voter_turnout_hist <- voter_turnout_hist %>%
  bind_rows(
    voter_turnout_hist %>%
      summarise(elector_count_2021 = sum(elector_count_2021),
                elector_count_2019 = sum(elector_count_2019),
                elector_count_2015 = sum(elector_count_2015),
                elector_count_2011 = sum(elector_count_2011),
                ballots_cast_2021 = sum(ballots_cast_2021),
                ballots_cast_2019 = sum(ballots_cast_2019),
                ballots_cast_2015 = sum(ballots_cast_2015),
                ballots_cast_2011 = sum(ballots_cast_2011),
                turnout_2021 = sum(ballots_cast_2021) / sum(elector_count_2021),
                turnout_2019 = sum(ballots_cast_2019) / sum(elector_count_2019),
                turnout_2015 = sum(ballots_cast_2015) / sum(elector_count_2015),
                turnout_2011 = sum(ballots_cast_2011) / sum(elector_count_2011)) %>%
      mutate(Province = "Canada",.before = 1)
  )
voter_turnout_hist$Province <- as_factor(voter_turnout_hist$Province)

voter_turnout_hist_long <- voter_turnout_hist %>%
  pivot_longer(
    cols = -Province,
    names_to = c(".value", "election_year"),
    names_pattern = "^(.*)_(\\d+)$" ) %>%
  mutate(election_year = as.integer(election_year))

voter_turnout_hist_long$Province <- as_factor(voter_turnout_hist_long$Province)

shared_turnout_hist_long <- SharedData$new(voter_turnout_hist_long,
                                           key = ~Province,
                                           group = "main")
shared_vote_method <- SharedData$new(vote_method,
                                     key = ~Province,
                                     group = "main")
shared_electors_polls <- SharedData$new(electors_polls_site,
                                        key = ~Province,
                                        group = "main")
shared_turnout_hist <- SharedData$new(voter_turnout_hist,
                                      key = ~Province,
                                      group = "main")

prov_filter <- filter_select(id = "prov_filter",
                             label = "Province",
                             sharedData = shared_turnout_hist_long,
                             group = ~Province,
                             multiple = FALSE
)

selected_province <- summaryTextSpan(
  data = shared_turnout_hist,
  statistic = "first",
  column = "Province")

avg_turnout <- summaryNumberSpan(
  data = shared_turnout_hist,
  statistic = "mean",
  column = "turnout_2021",
  digits = 1,
  number_format = "percent",
  locale = lang)
