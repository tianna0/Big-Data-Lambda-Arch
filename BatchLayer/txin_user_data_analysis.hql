CREATE TABLE txin_user_data_analysis AS
SELECT
    user_id,
    name,
    email_address,
    location,
    subscription_plan,
    usage_frequency,
    DATEDIFF(membership_end_date, CURRENT_DATE) AS days_to_expiry,
    CASE 
        WHEN DATEDIFF(membership_end_date, CURRENT_DATE) <= 30 THEN 'High Risk'
        WHEN DATEDIFF(membership_end_date, CURRENT_DATE) BETWEEN 31 AND 90 THEN 'Medium Risk'
        ELSE 'Low Risk'
    END AS risk_level,
    favorite_genres,
    devices_used,
    CONCAT('We recommend more ', favorite_genres, ' content on your ', devices_used) AS personalized_recommendation,
    COUNT(CASE WHEN renewal_status = 'Renewed' THEN 1 END) OVER (PARTITION BY subscription_plan) AS renew_count,
    COUNT(CASE WHEN renewal_status = 'Canceled' THEN 1 END) OVER (PARTITION BY subscription_plan) AS cancel_count
FROM txin_user_data;
