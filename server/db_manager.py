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
    sql_bus_line_table = """ CREATE TABLE IF NOT EXISTS bus_line (
                                id VARCHAR(32),
                                route TEXT,

                                CONSTRAINT PK_bus_line PRIMARY KEY (id)
                            ); """

    sql_car_schedule_table = """ CREATE TABLE IF NOT EXISTS car_schedule (
                                id INT,
                                bus_line_id VARCHAR(32),
                                schedule TEXT,

                                CONSTRAINT PK_schedule PRIMARY KEY (id, bus_line_id),
                                CONSTRAINT FK_car_schedule_bus_line FOREIGN KEY (bus_line_id) REFERENCES bus_line(id)
                            ); """

    close_at_end = False
    # create a database connection
    if conn is None:
        conn = create_connection(DATABASE)
        close_at_end = True

    # create tables
    if conn is not None:
        # create bus_line table
        create_table(conn, sql_bus_line_table)

        # create car_schedule table
        create_table(conn, sql_car_schedule_table)

        if close_at_end: conn.close()
    else:
        print("Error! cannot create the database connection.")



###################################################################
#                                                                 #
#                            INSERTS                              #
#                                                                 #
###################################################################

def insert_bus_line(conn, bus_line_id, route):
    sql = ''' INSERT INTO bus_line(id, route)
              VALUES(?, ?) '''
    cur = conn.cursor()
    cur.execute(sql, (bus_line_id, route))

    conn.commit()


def insert_schedule(conn, bus_line_id, car_id, schedule):
    sql = ''' INSERT INTO car_schedule(id, bus_line_id, schedule)
              VALUES(?, ?, ?) '''
    cur = conn.cursor()
    cur.execute(sql, (car_id, bus_line_id, schedule))    
        
    conn.commit()

###################################################################
#                                                                 #
#                            QUERIES                              #
#                                                                 #
###################################################################
def select_lines(conn):
    sql = ''' SELECT * FROM bus_line '''
    cur = conn.cursor()
    cur.execute(sql)

    return cur.fetchall()


def select_line(conn, id):
    sql = ''' SELECT * FROM bus_line WHERE id = ?'''
    cur = conn.cursor()
    cur.execute(sql, (id,))

    return cur.fetchall()


def select_schedule(conn, car_id, bus_line_id):
    sql = ''' SELECT schedule FROM car_schedule WHERE id = ? AND bus_line_id = ? '''
    cur = conn.cursor()
    cur.execute(sql, (car_id, bus_line_id))

    return cur.fetchall()
