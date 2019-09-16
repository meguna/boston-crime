import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import MiniBatchKMeans
from collections import Counter
import sys

crime_df = pd.read_csv('./crime/cleaned_crime_data.csv')
pd.set_option('display.max_columns', None)

crime_df = crime_df.dropna()

crime_p1 = crime_df[crime_df['UCR_PART'] == 'Part One']
crime_p2 = crime_df[crime_df['UCR_PART'] != 'Part One']

NUM_CLUSTERS = int(sys.argv[1]) or 5000;

p1_ratio = int(float(len(crime_p1.index)) / float((len(crime_p1.index) + len(crime_p2.index))) * NUM_CLUSTERS);
p2_ratio = NUM_CLUSTERS - p1_ratio;

def generate_cluster(df, num, name):
    kmeans = MiniBatchKMeans(n_clusters=num).fit(zip(df.Long, df.Lat))
    centroids = kmeans.cluster_centers_
    counts = dict(Counter(kmeans.labels_)).values()
    lng = []
    lat = []
    for i in centroids:
        lng.append(i[0])
        lat.append(i[1])
    cluster_df = pd.DataFrame(zip(lng, lat, counts), columns = ['Long', 'Lat', 'Size'])

    print(cluster_df.head())
    print(cluster_df.dtypes)
    cluster_df.to_csv('./crime/clustered_crime_data_%s_%d.csv' % (name, NUM_CLUSTERS), index=False)

generate_cluster(crime_p1, p1_ratio, 'p1')
generate_cluster(crime_p2, p2_ratio, 'p2')
