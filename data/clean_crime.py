import pandas as pd
import geopandas as gp
from constants import MA_STATE_PROJECTION
from shapely.geometry import Point

crime_df = pd.read_csv('./crime/crime.csv')
pd.set_option('display.max_columns', None)

del crime_df['SHOOTING']

def accurate_lat(row):
	return row['Location'][1:12].strip()

def accurate_long(row):
	return row['Location'][14:26].strip()

crime_df['Lat'] = crime_df.apply(lambda row: accurate_lat(row), axis=1)
crime_df['Long'] = crime_df.apply(lambda row: accurate_long(row), axis=1)

del crime_df['Location']
del crime_df['DISTRICT']
del crime_df['REPORTING_AREA']
del crime_df['OFFENSE_CODE']
del crime_df['INCIDENT_NUMBER']

def fix_locs_lat(row):
    if row['Lat'] == "0.00000000,":
        return None
    elif row['Lat'] == '-1.00000000':
        return None
    else:
        return row['Lat']

def fix_locs_long(row):
    if row['Long'] == '.00000000)':
        return None
    elif row['Long'] == '-1.00000000)':
        return None
    else:
        return row['Long']

crime_df = crime_df.assign(Lat=crime_df.apply(fix_locs_lat, axis=1))
crime_df = crime_df.assign(Long=crime_df.apply(fix_locs_long, axis=1))

crime_df['Lat'] = crime_df['Lat'].astype(float)
crime_df['Long'] = crime_df['Long'].astype(float)

crime_df.to_csv('./crime/cleaned_crime_data.csv', index=False)

crime_df = crime_df[crime_df['Lat'].notnull()]
crime_df = crime_df[crime_df['Long'].notnull()]

crime_gdf = gp.GeoDataFrame(
	crime_df,
	crs={'init': 'epsg:4326'},
	geometry=[Point(xy) for xy in zip(crime_df.Long, crime_df.Lat)]
)

crime_gdf.to_file('./out/crime.shp')