CREATE EXTERNAL TABLE txin_user_data (
    user_id INT,
    name STRING,
    email_address STRING,
    username STRING,
    date_of_birth DATE,
    gender STRING,
    location STRING,
    membership_start_date DATE,
    membership_end_date DATE,
    subscription_plan STRING,
    payment_information STRING,
    renewal_status STRING,
    usage_frequency STRING,
    purchase_history STRING,
    favorite_genres STRING,
    devices_used STRING,
    engagement_metrics STRING,
    feedback_ratings FLOAT,
    customer_support_interactions INT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE
LOCATION 'wasbs://hbase-mpcs5301-2024-10-20t23-28-51-804z@hbasempcs5301hdistorage.blob.core.windows.net/txin_final'
TBLPROPERTIES ('skip.header.line.count'='1');
