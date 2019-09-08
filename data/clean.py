import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.api as sm
import math

crime_df = pd.read_csv('./crime.csv')
pd.set_option('display.max_columns', None)

del crime_df['SHOOTING']

def accurate_lat(row):
	return row['Location'][1:12]

def accurate_long(row):
	return row['Location'][14:26]

crime_df['Lat'] = crime_df.apply (lambda row: accurate_lat(row), axis=1)
crime_df['Long'] = crime_df.apply (lambda row: accurate_long(row), axis=1)

del crime_df['Location']
del crime_df['DISTRICT']
del crime_df['REPORTING_AREA']
del crime_df['OFFENSE_CODE']

print(crime_df.head(10))

crime_df.to_csv('cleaned_crime_data.csv', index=False)