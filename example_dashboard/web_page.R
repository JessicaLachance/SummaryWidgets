
content <- tagList(
  h2(intro_h2),
  p(intro_para),
  intro_data_avail,
  intro_stat_report,
  h2(instructions_h2),
  p(instructions_para),
  div(
    h2(dashboard_h2),
    div(
      class = "well",
      tags$nav(
        varArgs = list("aria-label" = dashboard_nav),
        prov_filter
      ),
      p(!!!dashboard_para, .noWS = "outside"),
      h3(polling_sites_h3),
      !!!polling_sites_para,
      h4(!!!polling_sites_h4,
         .noWS = "outside"),
      layout_columns(
        col_widths = breakpoints(xs=c(12,12,12), md=c(6,6,6), lg=c(4,4,4)),
        row_heights = breakpoints(xs="120px", lg="150px"),
        summaryValueBox(
          data = shared_electors_polls,
          statistic = "sum",
          locale = lang,
          column = "stationary_polls",
          caption = stationary_polls_caption,
          icon = "building-fill",
          color_thresholds = list(domain = c(0),
                                  range = c("grey","#6a0032")),
          width = "100%",
          height = "100%"
        ),
        summaryValueBox(
          data = shared_electors_polls,
          statistic = "sum",
          locale = lang,
          column = "mobile_polls",
          caption = mobile_polls_caption,
          icon = "geo-alt-fill",
          color_thresholds = list(domain = c(0),
                                  range = c("grey","#6a0032")),
          width = "100%",
          height = "100%"
        ),
        summaryValueBox(
          data = shared_electors_polls,
          statistic = "sum",
          column = "advanced_polls",
          locale = lang,
          caption = advanced_polls_caption,
          icon = "calendar2-week-fill",
          color_thresholds = list(domain = c(0),
                                  range = c("grey","#6a0032")),
          width = "100%",
          height="100%"
        )
      ),
      h3(turnout_h3),
      !!!vote_method_para,
      layout_columns(
        col_widths = breakpoints(md=c(12,12),lg=c(3,9)),
        div(
          h4(!!!turnout_h4,
             .noWS = "outside"),
          summaryGauge(
            data = shared_turnout_hist,
            statistic = "mean",
            column = "turnout_2021",
            min = min(voter_turnout_hist$turnout_2021),
            max = max(voter_turnout_hist$turnout_2021),
            number_format = "percent",
            digits = 1,
            locale = lang,
            color_thresholds = list(domain = c(0),
                                    range = c("grey","#036064")),
            height = "250px",
            width="100%"
          )
        ),
        div(
          h4(!!!vote_method_h4
             ,.noWS = "outside"),
          layout_columns(
            col_widths = breakpoints(lg=c(12,12,12,12),xl=c(6,6,6,6)),
            row_heights = "120px",
            summaryValueBox(
              data = shared_vote_method,
              statistic = "sum",
              locale = lang,
              column = "stationary_poll_votes",
              caption = stationary_votes_caption,
              color_thresholds = list(domain = c(0,1000,10000,100000,1000000,10000000),
                                      range = c('#edf8fb','#ccece6','#99d8c9','#66c2a4',
                                                '#41ae76','#238b45','#005824')),
              width = "100%",
              height = "100%"
            ),
            summaryValueBox(
              data = shared_vote_method,
              statistic = "sum",
              locale = lang,
              column = "mobile_poll_votes",
              caption = mobile_votes_caption,
              color_thresholds = list(domain = c(0,1000,10000,100000,1000000,10000000),
                                      range = c('#edf8fb','#ccece6','#99d8c9','#66c2a4',
                                                '#41ae76','#238b45','#005824')),
              width = "100%",
              height = "100%"
            ),
            summaryValueBox(
              data = shared_vote_method,
              statistic = "sum",
              locale = lang,
              column = "advanced_poll_votes",
              caption = advanced_votes_caption,
              color_thresholds = list(domain = c(0,1000,10000,100000,1000000,10000000),
                                      range = c('#edf8fb','#ccece6','#99d8c9','#66c2a4',
                                                '#41ae76','#238b45','#005824')),
              width = "100%",
              height="100%"
            ),
            summaryValueBox(
              data = shared_vote_method,
              statistic = "sum",
              locale = lang,
              column = "svr_votes",
              caption = svr_votes_caption,
              color_thresholds = list(domain = c(0,1000,10000,100000,1000000,10000000),
                                      range = c('#edf8fb','#ccece6','#99d8c9','#66c2a4',
                                                '#41ae76','#238b45','#005824')),
              width = "100%",
              height="100%"
            )
          ),
        ),
      ),
      div(
        class="mrgn-tp-xl",
        p(!!!table_caption,
          id = "turnout_hist_cap",
          style = 'caption-side: top; text-align: center; font-weight: bold;',
          .noWS = "outside"),
        datatable(
          shared_turnout_hist_long,
          selection = "none",
          container = accessible_table("turnout_hist_cap",turnout_table_col_names),
          rownames = FALSE,
          colnames = c('Province', 'Elector Count', 'Ballots Cast', 'Turnout'),
          extensions = c("Buttons"),
          options = list(
            responsive = FALSE,
            scrollX = TRUE,
            paging = FALSE,
            dom = 't<"dt-footer"p><"dt-buttons-bottom-left"B>',
            buttons = c('copy', 'csv')
          )
        )%>%
          formatRound(c('elector_count', 'ballots_cast'), digits = 0) %>%
          formatPercentage('turnout', digits = 1)
      )
    )
  ),
  h2(glossary_h2),
  df_to_html_table(glossary,glossary_header,glossary_caption)
)
