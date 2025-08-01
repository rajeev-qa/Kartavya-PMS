-- Create database and user
CREATE DATABASE c_pms_z;
CREATE USER kartavya_user WITH ENCRYPTED PASSWORD 'kartavya_password';
GRANT ALL PRIVILEGES ON DATABASE c_pms_z TO kartavya_user;

-- Connect to the database
\c c_pms_z;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO kartavya_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kartavya_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kartavya_user;
