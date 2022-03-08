import sqlite3
from sqlite3 import Error

DATABASE_PATH = "./"

#######################################################
### :desc: create a database connection to the SQLite
###        database specified by db_file.
### :param db_file: database file
### :return: Connection object or None
#######################################################
def create_connection(db_file):
    conn = None
    db_file = DATABASE_PATH + "/" + db_file
    try:
        conn = sqlite3.connect(db_file)
        create_database(db_file, conn)
        return conn
    except Error as e:
        print(e)

    return conn


#######################################################
### :desc: create a table from the create_table_sql 
###        statement.
### :param conn: Connection object
### :param create_table_sql: a CREATE TABLE statement
### :return: None
#######################################################
def create_table(conn, create_table_sql):
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
    except Error as e:
        print(e)


#######################################################
### :desc: create database and database file if it not
###        exists.
### :param DATABASE: file
### :param conn: Connection object
### :return: None
#######################################################
def create_database(DATABASE, conn = None):
    sql_simhash_table = """ CREATE TABLE IF NOT EXISTS simhashes (
                                simhash VARCHAR(128),
                                owner_eth_addr varchar(40),

                                CONSTRAINT PK_simhashes PRIMARY KEY (simhash)
                            ); """


    close_at_end = False
    # create a database connection
    if conn is None:
        conn = create_connection(DATABASE)
        close_at_end = True

    # create tables
    if conn is not None:
        # create simhash table
        create_table(conn, sql_simhash_table)

        if close_at_end: conn.close()
    else:
        print("Error! cannot create the database connection.")



###################################################################
#                                                                 #
#                            INSERTS                              #
#                                                                 #
###################################################################

def insert_simhash(conn, simhash, owner_eth_addr):
    sql = ''' INSERT INTO simhashes(simhash, owner_eth_addr)
              VALUES(?, ?) '''
    cur = conn.cursor()
    cur.execute(sql, (simhash, owner_eth_addr))
    conn.commit()

###################################################################
#                                                                 #
#                            QUERIES                              #
#                                                                 #
###################################################################
def select_simhashes(conn):
    sql = ''' SELECT * FROM simhashes '''
    cur = conn.cursor()
    cur.execute(sql)

    return cur.fetchall()


def select_simhashes_from_owner(conn, owner_eth_addr):
    sql = ''' SELECT * FROM simhashes WHERE owner_eth_addr = ? '''
    cur = conn.cursor()
    cur.execute(sql, (owner_eth_addr,))

    return cur.fetchall()