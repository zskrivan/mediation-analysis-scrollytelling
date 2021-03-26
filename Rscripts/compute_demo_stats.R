suppressPackageStartupMessages({
  library(tidyverse)
})

rm(list = ls())

source_csv <- "../public/data/demo.csv"
visit_number <- 6

df <- read_csv(source_csv) %>%
  filter(visit == visit_number) %>%
  mutate(treatment = as_factor(treatment))

summary_stats <- df %>%
  group_by(treatment) %>%
  summarise(mean_dlqi = mean(dlqi),
            mean_itch = mean(itch))

model <- lm(dlqi ~ treatment + itch, df)
summary(model)
