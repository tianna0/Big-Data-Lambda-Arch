# Big-Data-Lambda-Arch
This is an Amazon Prime User Behavior and Subscription Analysis Platform. It aims to analyze user data in real time and process it in batches through the Lambda architecture to understand user behavior and subscription patterns, help optimize subscription services, provide personalized recommendations, and prevent user churn. 

# Overview
Data Used: [Amazon Prime Userbase Dataset on Kaggle](https://www.kaggle.com/datasets/arnavsmayan/amazon-prime-userbase-dataset?resource=download)
Languages/Platforms used: Hadoop DFS, HBase, Hive, Spark, Kafka, Scala, Java, Node.js 
Project Structure:
├── BatchLayer: Ingests data into HDFS, create Hive table and a batch view in HBase
├── SpeedLayer: Use Spark Streaming to consume real-time data streams from Kafka and store them in HBase
├── WebApp: Lets user query final HBase serving layer views
└── Screenshot: Screenshots of the front-end webapp

# Running the app
