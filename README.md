# Big-Data-Lambda-Arch

This is an **Amazon Prime User Behavior and Subscription Analysis Platform**. It analyzes user data in real-time and processes it in batches through the Lambda architecture. The platform provides insights into user behavior and subscription patterns, helping to optimize subscription services, offer personalized recommendations, and prevent user churn.

## Overview

### Data Used
[Amazon Prime Userbase Dataset on Kaggle](https://www.kaggle.com/datasets/arnavsmayan/amazon-prime-userbase-dataset?resource=download)

### Languages/Platforms Used
- **Hadoop DFS**
- **HBase**
- **Hive**
- **Spark**
- **Kafka**
- **Scala**
- **Java**
- **Node.js**

### Project Structure
- **Batch Layer:** Ingests data into HDFS, creates Hive tables, and generates a batch view in HBase.
- **Speed Layer:** Uses Spark Streaming to consume real-time data streams from Kafka and store them in HBase.
- **WebApp:** Provides a user interface to query final HBase serving layer views.
- **Screenshot:** Screenshots of the front-end web app are included.

## Deployment

The app is deployed on the cluster: `sshuser@hbase-mpcs53014-2024-ssh.azurehdinsight.net`

### Accessing the Deployment
1. SSH into the cluster using the following command:
   ```bash
   ssh -i ~/path/to/your/key sshuser@hbase-mpcs53014-2024-ssh.azurehdinsight.net
2. Navigate to the project directory:
   ```bash
   cd txin/final

## Running the App
- Download the code and open the project in your IDE of choice.
- Set up the deployment configurations.
- Run the application by selecting ‘Run’ on the toolbar.

