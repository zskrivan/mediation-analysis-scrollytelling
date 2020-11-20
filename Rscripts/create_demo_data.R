library(dplyr)

# rm(list = ls())
set.seed(123)

target_csv <- "../public/data/demo.csv"

count_subjects <- 400

subject <- sample(1001:9999, count_subjects, replace = FALSE)
subject <- rep(subject, each = 2)

treatment <- rep(rep(c(0, 1), each = 2), count_subjects / 2)

visit <- rep(c(0, 1), count_subjects)

df <- data.frame(subject, treatment, visit)

# assign random BSA values
df$bsa <- 40 - 6 * df$treatment - 11 * df$visit + rnorm(2 * count_subjects, sd = 20)
bsa_index <- df$bsa < 0
df$bsa[bsa_index] <- 0 
bsa_index <- df$bsa > 95
df$bsa[bsa_index] <- 95
df$bsa <- round(df$bsa, 2)

# assign random EASI values
df$easi <- 25 - 4 * df$treatment - 8 * df$visit + rnorm(2 * count_subjects, sd = 10)
easi_index <- df$easi < 0
df$easi[easi_index] <- 0
df$easi <- round(df$easi, 2)

# assign random itch values
df$itch <- 8 - 2 * df$treatment - 1.5 * df$visit + rnorm(2 * count_subjects, sd = 3)
itch_index <- df$itch < 0
df$itch[itch_index] <- 0
itch_index <- df$itch > 10
df$itch[itch_index] <- 10
df$itch <- round(df$itch, 2)

# create fake data coefficients
b_0 <- 1.5
b_visit <- 2.0
b_rx <- -2.0
b_itch <- 2.0
sd_model <- 4
df$dlqi <- b_0 + b_rx * df$treatment + b_visit * df$visit + b_itch * df$itch + rnorm(2 * count_subjects, sd = sd_model)
dlqi_index <- df$dlqi < 0
df$dlqi[dlqi_index] <- 0
dlqi_index <- df$dlqi > 30
df$dlqi[dlqi_index] <- 10
df$dlqi <- round(df$dlqi, 0)

# cleanup
rm(list = c("bsa_index", "easi_index", "itch_index", "dlqi_index"))
rm(list = c("subject", "treatment", "visit"))

# print summary statistics
summary_stats <- df %>%
  group_by(treatment, visit) %>%
  summarise(count = n(),
            mean_dlqi = mean(dlqi),
            mean_bsa = mean(bsa),
            mean_easi = mean(easi),
            mean_itch = mean(itch))
print(summary_stats)

df_v0 <- df %>% filter(visit == 0)
model_v0_bsa <- lm(dlqi ~ treatment + bsa, df_v0)
model_v0_easi <- lm(dlqi ~ treatment + easi, df_v0)
model_v0_itch <- lm(dlqi ~ treatment + itch, df_v0)

df_v1 <- df %>% filter(visit == 1)
model_v1_bsa <- lm(dlqi ~ treatment + bsa, df_v1)
model_v1_easi <- lm(dlqi ~ treatment + easi, df_v1)
model_v1_itch <- lm(dlqi ~ treatment + itch, df_v1)

write.csv(df, target_csv, quote = FALSE, row.names = FALSE)
