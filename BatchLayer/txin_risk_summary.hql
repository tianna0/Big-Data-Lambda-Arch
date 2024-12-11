CREATE TABLE txin_risk_summary AS
SELECT
    'Low Risk' AS col_name,
    COUNT(*) AS count
FROM txin_user_data_analysis
WHERE risk_level = 'Low Risk'
UNION ALL
SELECT
    'Medium Risk' AS col_name,
    COUNT(*) AS count
FROM txin_user_data_analysis
WHERE risk_level = 'Medium Risk'
UNION ALL
SELECT
    'High Risk' AS col_name,
    COUNT(*) AS count
FROM txin_user_data_analysis
WHERE risk_level = 'High Risk';
