import pandas as pd

# Read in the two CSV files as Pandas DataFrames
code_df = pd.read_csv('./country_code.csv', usecols=['Country', 'code'])
happiness_df = pd.read_csv('./2019.csv', usecols=['Country', 'Happiness_Score'])

# Merge the two DataFrames on the "Country" column, keeping only rows that have a match in both DataFrames
merged_df = pd.merge(code_df, happiness_df, on="Country", how="left")

# Replace any missing happiness scores with 0
merged_df["Happiness_Score"].fillna(0, inplace=True)

# Rename the columns to match your desired output file
merged_df.columns = ["Country","code", "Happiness_Score"]

# Write the merged DataFrame to a new CSV file
merged_df.to_csv("merged5.csv", index=False)

print("Data saved to 'merged.csv'.")