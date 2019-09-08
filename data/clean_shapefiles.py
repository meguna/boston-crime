import pandas as pd
import geopandas as gp
import matplotlib.pyplot as plt

pd.set_option('display.max_columns', None)

ma = gp.read_file('./ma_towns')
bos = gp.read_file('./boston_neighborhoods')

# remeve Boston from MA map to reduce miniscule conflicts in topography
bostonRow = ma[ma['TOWN'] == 'BOSTON'].index
bosTownName = ma[ma['TOWN'] == 'BOSTON']['TOWN'].values[0]
bosPopl = ma[ma['TOWN'] == 'BOSTON']['POP2010'].values[0]
ma.drop(bostonRow, inplace=True)

# remove irrelevant columns
del ma['TOWN_ID']
del ma['POP1980']
del ma['POP1990']
del ma['POP2000']
del ma['POPCH80_90']
del ma['POPCH90_00']
del ma['TYPE']
del ma['FOURCOLOR']
del ma['FIPS_STCO']
del ma['SUM_ACRES']
del ma['SUM_SQUARE']
del ma['POPCH00_10']
del ma['SHAPE_Leng']
del ma['SHAPE_Area']
del bos['OBJECTID']
del bos['Acres']
del bos['Neighborho']
del bos['SqMiles']
del bos['ShapeSTAre']
del bos['ShapeSTLen']

MA_STATE_PROJECTION = '+proj=lcc +lat_1=41.71666666666667 +lat_2=42.68333333333333 +lat_0=41 +lon_0=-71.5 +x_0=200000 +y_0=750000.0000000001 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs'

# assign same projection before merge
ma = ma.to_crs(MA_STATE_PROJECTION)
bos = bos.to_crs(MA_STATE_PROJECTION)

# merge
ma_with_bos = gp.overlay(bos, ma, how='union')

# due to slight differences in topology and the merge function, some
# boston neighborhoods get assigned to non-Boston towns. Fix this error
def set_town(row):
    if row['Name'] is None:
        return row['TOWN']
    else:
        return bosTownName

def set_pop(row):
    if row['Name'] is None:
        return row['POP2010']
    else:
        return bosPopl

ma_with_bos = ma_with_bos.assign(TOWN=ma_with_bos.apply(set_town, axis=1))
ma_with_bos = ma_with_bos.assign(POP2010=ma_with_bos.apply(set_pop, axis=1))

# rename column
ma_with_bos = ma_with_bos.rename(columns={'name': 'bosSubNb'})

print(ma_with_bos.head())

ma_with_bos.to_file('./out/mabos.shp')