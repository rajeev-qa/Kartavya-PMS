# 🔧 Fix PostgreSQL Connection

## The Issue
Your `.env` file has placeholder credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/kartavya_pms"
```

## Quick Fix

1. **Update server/.env** with your actual PostgreSQL credentials:

```bash
# Replace with your actual PostgreSQL credentials
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/kartavya_pms"
```

2. **Create the database** (if not exists):
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE kartavya_pms;

# Exit
\q
```

3. **Run the setup commands**:
```bash
cd server
npm run db:push
npm run db:seed
npm run dev
```

## Common PostgreSQL Credentials

- **Username**: Usually `postgres` (default superuser)
- **Password**: The password you set during PostgreSQL installation
- **Host**: `localhost` (for local installation)
- **Port**: `5432` (default PostgreSQL port)
- **Database**: `kartavya_pms`

## Example Working Connection Strings:

```bash
# If your postgres password is "admin123"
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/kartavya_pms"

# If your postgres password is "password"
DATABASE_URL="postgresql://postgres:password@localhost:5432/kartavya_pms"

# If you have a different username
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/kartavya_pms"
```

Just replace `YOUR_ACTUAL_PASSWORD` with the password you set for PostgreSQL!