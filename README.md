# Team E: Bingo Code Repository

## Team Members
|        Student ID          |     Student Full Name      |
| ---------------------------| ---------------------------|
|         922254694          |     Ekarat Buddharuksa     |
|         922536937          |     Arcilla Karl Xavier    |
|         923091933          |     Nguyen Danish          |
|         921759134          |     Phyu Mya               |

***

## Setup
**FOR INSTUCTOR. The .env file for this specific project will be provide upon submission. The .env file provide will contain credential to the remote database. Please use that file to test the project**
1. After you clone the repository, create a `.env` file in the root directory and add this header into the `.env` file:
    ```plaintext
    POSTGRE_ID=''
    POSTGRE_PASS=''
    DB_HOST=''
    ```
    Fill in your PostgreSQL information.

2. Navigate to `/backend/database`, where there will be 2 files available:
   - **backup.sql**: This file contains the SQL query to create the schema in your PostgreSQL database.
   - **index.ts**: SQL query collection file. You need to change the following:
     ```
     Line 9, change port, database, and ssl configuration according to your PostgreSQL setting
     ```

## Starting the Application
### Running in Development Mode
 ```
 npm run dev 
 ```
### Running in production
 ```
 npm run build
 npm start
 ```
