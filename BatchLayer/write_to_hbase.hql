CREATE EXTERNAL TABLE txin_user_data_hive (
    user_id STRING,
    name STRING,
    email_address STRING,
    location STRING,
    subscription_plan STRING,
    usage_frequency STRING,
    days_to_expiry INT,
    risk_level STRING,
    favorite_genres STRING,
    devices_used STRING,
    personalized_recommendation STRING,
    renew_count BIGINT,
    cancel_count BIGINT
)
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'
WITH SERDEPROPERTIES (
    "hbase.columns.mapping" = ":key,info:name,info:email_address,info:location,subscription:subscription_plan,subscription:usage_frequency,subscription:days_to_expiry,subscription:risk_level,preferences:favorite_genres,preferences:devices_used,preferences:personalized_recommendation,metrics:renew_count,metrics:cancel_count"
)
TBLPROPERTIES ("hbase.table.name" = "txin_user_data_hbase");


Insert data
INSERT INTO TABLE txin_user_data_hive
SELECT
    CAST(user_id AS STRING), 
    name,
    email_address,
    location,
    subscription_plan,
    usage_frequency,
    days_to_expiry,
    risk_level,
    favorite_genres,
    devices_used,
    personalized_recommendation,
    renew_count,
    cancel_count
FROM txin_user_data_analysis;
