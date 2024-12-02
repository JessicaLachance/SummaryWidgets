source_url <- paste0(
  "https://www.elections.ca/content.aspx?section=res&dir=rep/off/44gedata&document=summary&lang=",
  lang)

stat_report_url <- paste0(
  "https://elections.ca/content.aspx?section=res&dir=rep/off/sta_ge44&document=index&lang=",
  lang)

if (lang == "en") {
  title <- "Visualizing the Official Voting Results of the 44th General Election"
  intro_h2 <- "Introduction"
  intro_para <- "The 44th General Election took place on September 21, 2021.
        This dashboard visualizes the official voting results of this event by province and territory"
  intro_data_avail <- p(
    "This data also is publically available at",
    a(href=source_url,
      "the Elections Canada website."),
    .noWS = "outside"
  )
  intro_stat_report <- p(
    "The text contained within the dashboard are extracts from the ",
    a(href = stat_report_url, "Report on the 44th General Election of September 20, 2021"),
    "The ",
    span("Elections Canada Act", class="fst-italic"),
    " mandates that the Chief Electoral Officer of Elections Canada produce a report summarizing proceedings after each federal election."
  )
  instructions_h2 <- "Instructions"
  instructions_para <- "The dashboard below summarizes the results of the 44th General Election by province and territory. You can use the drop down menu at the top of the dashboard to select a province. You can also select 'Canada' in the drop down menu to view data for the whole country. The contents of the dashboard will then change based on your selection."
  dashboard_h2 <- "44th General Election Results Dashboard"
  dashboard_nav <- "Dashboard options"
  dashboard_para <- list(
    "You currently are viewing data for ",
    selected_province,
    tags$span(". In the 44th general election ", .noWS = c("outside")),
    selected_province,
    " had a turnout of ",
    avg_turnout,
    " compared to the national turnout of ",
    label_percent(accuracy = 0.1)(voter_turnout_hist %>%
                                    filter(Province == "Canada") %>%
                                    pull(turnout_2021)),
    tags$span(".", .noWS = c("outside"))
  )
  polling_sites_h3 <- "Polling locations"
  polling_sites_para <- list(
    p("In preparing for the general election, it was expected that finding locations for polling places would present major challenges. Many traditional polling places, such as community centres, churches and schools, would likely be unavailable owing to concerns about the potential spread of COVID-19 or because these locations were being used as vaccination or testing centres. Other locations, although available, would not have the space or infrastructure needed to meet physical distancing or other public health requirements."),
    p("As polling places would likely be fewer and farther apart, electors could face increased travel distances, accessibility issues and longer lineups. To mitigate these risks, returning officers considered all possible alternatives, including places not usually used for voting, and communicated with property owners and managers at regular intervals throughout 2020 and 2021 to confirm availability."),
    p("Compared with the 43rd general election, there were 3 percent fewer advance polling places and 7 percent fewer election day polling places. Overall, this reduction proved to be manageable; however, in some instances, the large number of polling stations resulted in bottlenecks and lineups.")
  )
  polling_sites_h4 <- list(
    span("Polling locations in "),
    selected_province)
  stationary_polls_caption <- "Number of Stationary Polls"
  mobile_polls_caption <- "Number of Mobile Polls"
  advanced_polls_caption <- "Number of Advanced Polls"
  turnout_h3 <- "Voter turnout"
  turnout_h4 <- list(
    "Voter turnout in ",
    selected_province,
    "relative to other provinces in 2021"
  )
  gauge_title <- "Voter turnout as a gauge."
  vote_method_h4 <- list(
    "Breakdown of valid votes in ",
    selected_province,
    " by voting methods")
  vote_method_para <- list(
    p("In view of the pandemic, Elections Canada had prepared for a major change in the patterns of elector behaviour during the 44th general election. Electors not comfortable with voting in person at their polling place could instead vote by mail using a special ballot. While initial data collected in 2020 showed that as many as 5 million Canadians might do so the agency revised its estimate for the uptake of this voting method several times throughout the planning period as the pandemic
situation changed."),
    p("While the actual number of electors who chose to vote by special ballot turned out to be much lower than initially planned for, more Canadians than ever before voted by special ballot from within their electoral district, either by mail or at a local office.")
  )

  stationary_votes_caption <- "Votes at Stationary Polls"
  mobile_votes_caption <- "Votes at Mobile Polls"
  advanced_votes_caption <- "Votes at Advanced Polls"
  svr_votes_caption <- "Votes by Special Ballot"
  table_caption <- list(
    "Summary of historical voter turnout data in ",
    selected_province,
    tags$span(paste0(", ",
                     min(voter_turnout_hist_long$election_year),
                     " - " ,
                     max(voter_turnout_hist_long$election_year),
                     ".")
              , .noWS = "outside"
    )
  )
  turnout_table_col_names <- c('Province', 'Election Year', 'Elector Count', 'Ballots Cast', 'Turnout')
  glossary_h2 <- "Glossary"
  glossary_caption <- "Glossary of terms used in this dashboard"
  glossary_header <- c("Term", "Definition")
  glossary <- data.frame(
    terms = c("Stationary polling",
              "Mobile polling",
              "Advanced polling",
              "Special voting rules (SVR)",
              "Valid votes",
              "Ballots cast",
              "Elector count",
              "Turnout"),
    definitions = c(
      "Stationary polling is the most common type of voting method. It describes all voting that happens on election day at an elector's assigned polling location",
      "Mobile polling describes special cases where the poll location is mobile but electors are still counted as having voted on election. This is a common accessibility measure to serve electors in long-term care and retirement facilities.",
      "Advanced polling describes voting which takes place on during the advanced polling period i.e. the 10th, 9th, 8th, and 7th days before polling day. Like stationary polls, electors vote at an assigned voting location.",
      "Special Voting Rules, or SVR, includes all other types of ballots cast. Some Elections Canada reports will separate this category into two groups. SVR Group 1 includes Canadian citizens residing outside Canada, members of the Canadian Armed Forces who voted at military polls, incarcerated electors and Canadian citizens residing in Canada who voted by special ballot outside their electoral districts. SVR Group 2 includes Canadian citizens residing in Canada who voted by special ballot inside their electoral districts. This report goups both types of SVR together.",
      "Valid votes are ballots which were cast for a candidate and were not rejected.",
      "Ballots casts includes all ballots which were counted, including valid votes and rejected ballots.",
      "Elector count refers to the official number of electors registered to voted on election day.",
      "The official turnout number is calculated by dividing the number of ballots cast by the number of registered electors."
    )
  )
} else if (lang == "fr") {
  title <- "Visualisation des Résultats Officiels de Vote de la 44e Élection Générale"
  intro_h2 <- "Introduction"
  intro_para <- "La 44e élection générale a eu lieu le 21 septembre 2021. Ce tableau de bord visualise les résultats officiels de cette élection par province et territoire."
  intro_data_avail <- p(
    "Ces données sont également disponibles publiquement sur le",
    a(href = source_url, "site Web d'Élections Canada."),
    .noWS = "outside"
  )
  intro_stat_report <- p(
    "Le texte contenu dans ce tableau de bord vient de ",
    a(href = stat_report_url, "Rapport sur la 44e élection générale du 20 septembre 2021"),
    ". La ",
    span("Loi électorale du Canada", class = "fst-italic"),
    " oblige le directeur général des élections d'Élections Canada à produire un rapport résumant les événements après chaque élection fédérale."
  )
  instructions_h2 <- "Utiliser le tableau de bord"
  instructions_para <- "Le tableau de bord ci-dessous résume les résultats de la 44e élection générale par province et territoire. Vous pouvez utiliser le menu déroulant en haut du tableau de bord pour sélectionner une province. Vous pouvez également sélectionner 'Canada' dans le menu déroulant pour voir les données pour l'ensemble du pays. Le contenu du tableau de bord changera ensuite en fonction de votre sélection."
  dashboard_h2 <- "Tableau de Bord des Résultats de la 44e Élection Générale"
  dashboard_nav <- "Options de graphique"
  dashboard_para <- list(
    "Vous voyez actuellement les données pour ",
    selected_province,
    tags$span(". Lors de la 44e élection générale, ", .noWS = c("outside")),
    selected_province,
    " avait un taux de participation de ",
    avg_turnout,
    " par rapport au taux de participation fédérale de ",
    label_percent(accuracy = 0.1,
                  suffix = " %",
                  decimal.mark = ",")(voter_turnout_hist %>%
                                    filter(Province == "Canada") %>%
                                    pull(turnout_2021)),
    tags$span(".", .noWS = c("outside"))
  )
  polling_sites_h3 <- "lieux de scrutin"
  polling_sites_para <- list(
    p("En se préparant pour l'élection, Élections Canada s'attendait à ce que la recherche de locaux pour les lieux de scrutin présente des défis majeurs. De nombreux lieux de scrutins traditionnels, comme les centres communautaires, les églises et les écoles, ne seraient vraisemblablement pas disponibles en raison de préoccupations liées à propagation de la COVID‑19 ou parce que ces lieux servaient de centre de vaccination ou de dépistage. D'autres locaux, bien que disponibles, ne disposeraient pas de l'espace ou de l'infrastructure nécessaires pour respecter la distanciation physique ou d'autres exigences de santé publique."),
    p("Puisque les lieux de scrutin allaient sans doute être moins nombreux et plus éloignés les uns des autres, il y avait un risque que les électeurs doivent parcourir de plus longues distances, soient confrontés à des problèmes d'accessibilité et des files d'attente plus longues. Pour atténuer ces risques, les directeurs du scrutin ont envisagé toutes les solutions possibles, y compris d'utiliser des lieux qui ne sont pas habituellement utilisés pour le vote, et ont communiqué avec les propriétaires et les gestionnaires immobiliers à intervalles réguliers tout au long de 2020 et de 2021 pour en confirmer la disponibilité."),
    p("Comparativement à la 43e élection générale, le nombre de lieux de vote par anticipation a diminué de 3 % et celui des lieux de scrutin, le jour de l'élection, de 7 %. Globalement, cette diminution s'est révélée gérable; cependant, à certains endroits, le nombre élevé de bureaux de vote a engendré des goulots d'étranglement et des files à l'extérieur des édifices.")
  )
  polling_sites_h4 <- list(
    span("Bureaux de vote en/au "),
    selected_province)
  stationary_polls_caption <- "Nombre de bureaux de vote fixes"
  mobile_polls_caption <- "Nombre de bureaux de vote mobiles"
  advanced_polls_caption <- "Nombre de bureaux de vote par anticipation"
  turnout_h3 <- "Participation électorale"
  turnout_h4 <- list(
    "Participation électoral en/au ",
    selected_province,
    "par rapport aux autres provinces en 2021"
  )
  gauge_title <- "Taux de participation visualisée dans une gauge."
  vote_method_h4 <- list(
    "Répartition des valid votes en/au ",
    selected_province,
    " par méthode de vote.")
  vote_method_para <- list(
    p("En raison de la pandémie, Élections Canada s'était préparé à ce que le comportement des électeurs change considérablement lors de la 44e élection générale. Les électeurs qui ne se sentaient pas à l'aise de voter en personne à leur lieu de scrutin pouvaient voter par la poste en utilisant un bulletin spécial. Bien que les données initiales recueillies en 2020 montraient que jusqu'à 5 millions de Canadiens pourraient voter par la postenote, l'organisme a révisé cette estimation à maintes reprises au cours de la période de planification, en fonction de l'évolution de la pandémie."),
    p("Même si le nombre réel d'électeurs ayant choisi de voter par bulletin spécial a été nettement inférieur aux prévisions initiales, plus de Canadiens que jamais ont voté par bulletin spécial dans leur circonscription, soit par la poste, soit à un bureau local.")
  )
  stationary_votes_caption <- "Votes aux bureaux de scrutin fixes"
  mobile_votes_caption <- "Votes aux bureaux de scrutin intinérants"
  advanced_votes_caption <- "Votes aux bureaux de vote par anticipation"
  svr_votes_caption <- "Votes en vertu des Règles électorales spéciales"
  table_caption <- list(
    "Résumé des données historiques de participation des électeurs dans ",
    selected_province,
    tags$span(paste0(", ",
                     min(voter_turnout_hist_long$election_year),
                     " à ",
                     max(voter_turnout_hist_long$election_year),
                     "."),
              .noWS = "outside"
    )
  )
  turnout_table_col_names <- c("Province", "Année de l'élection", "Nombre d'électeurs", "Bulletins de vote déposés", "Participation")
  glossary_h2 <- "Glossaire"
  glossary_caption <- "Glossaire des termes utilisés dans ce tableau de bord"
  glossary_header <- c("Terme", "Définition")
  glossary <- data.frame(
    terms = c("Bureaux de vote fixes",
              "Bureaux de vote intinérants",
              "Bureaux de vote par anticipation",
              "Règles électorales spéciales (RES)",
              "Votes valides",
              "Bulletins déposés",
              "Nombre d'électeurs",
              "Participation"),
    definitions = c(
      "De voter aux des bureaux de vote fixes est le méthode de vote le plus utilisé. Il désigne tout votes effectués le jour de l'élection au bureau de vote assigné à l'électeur.",
      "Des bureaux de votes intinérants désigne des cas particuliers où le lieu de vote est mobile, mais les électeurs sont toujours comptés comme ayant voté le jour de l'élection. C'est une mesure d'accessibilité souvent utiliser pour servir les électeurs dans les établissements de soins de longue durée et de les résidences pour personnes âgées.",
      "Le vote par anticipation désigne le vote qui a lieu pendant la période de vote par anticipation, c'est-à-dire les 10e, 9e, 8e et 7e jours avant le jour du scrutin. Comme les bureaux de vote fixes, les électeurs votent dans un lieu de vote assigné.",
      "Les Règles électorales spéciales, ou RES, incluent tous les autres types de bulletins de vote. Certains rapports d'Élections Canada sépareront cette catégorie en deux groupes. Le Groupe 1 des RES comprend les citoyens canadiens résidant à l’extérieur du Canada, les membres des Forces armées canadiennes qui ont voté aux scrutins militaires, les électeurs incarcérés et les citoyens canadiens résidant au Canada qui ont voté par bulletin spécial à l’extérieur de leur circonscription. Le Groupe 2 des RES comprend les citoyens canadiens résidant au Canada qui ont voté par bulletin spécial dans leur circonscription électorale. Ce rapport regroupe les deux types de RES.",
      "Les votes valides sont les bulletins déposés pour un candidat et non rejetés.",
      "Les bulletins déposés incluent tous les bulletins comptés, y compris les votes valides et les bulletins rejetés.",
      "Le nombre d'électeurs désigne le nombre officiel d'électeurs inscrits pour voter le jour de l'élection.",
      "Le taux de participation officiel est calculé en divisant le nombre de bulletins déposés par le nombre d'électeurs inscrits."
    )
  )

}
