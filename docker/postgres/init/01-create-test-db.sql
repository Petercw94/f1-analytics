DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'f1_test') THEN
    CREATE ROLE f1_test LOGIN PASSWORD 'f1_test_pw';
  END IF;
END
$$;

SELECT 'CREATE DATABASE f1_mock OWNER f1_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'f1_mock')
\gexec

GRANT ALL PRIVILEGES ON DATABASE f1_mock TO f1_test;
