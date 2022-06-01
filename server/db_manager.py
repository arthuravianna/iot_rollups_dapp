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
    sql_bus_line_table = """ CREATE TABLE IF NOT EXISTS line (
                                id VARCHAR(32),
                                route TEXT,

                                CONSTRAINT PK_line PRIMARY KEY (id)
                            ); """

    sql_trip_schedule_table = """ CREATE TABLE IF NOT EXISTS trip_schedule (
                                id VARCHAR(48),
                                bus_line_id VARCHAR(32),
                                schedule TEXT,

                                CONSTRAINT PK_trip_schedule PRIMARY KEY (id),
                                CONSTRAINT FK_trip_schedule_bus_line FOREIGN KEY (bus_line_id) REFERENCES line(id)
                            ); """

    sql_stop_table = """ CREATE TABLE IF NOT EXISTS stop (
                                stop_order INT,
                                bus_line_id VARCHAR(32),
                                lat FLOAT,
                                lon FLOAT,

                                CONSTRAINT PK_stop PRIMARY KEY (stop_order, bus_line_id),
                                CONSTRAINT FK_stop_line FOREIGN KEY (bus_line_id) REFERENCES line(id)
                            ); """

    close_at_end = False
    # create a database connection
    if conn is None:
        conn = create_connection(DATABASE)
        close_at_end = True

    # create tables
    if conn is not None:
        # create line table
        create_table(conn, sql_bus_line_table)

        # create trip_schedule table
        create_table(conn, sql_trip_schedule_table)

        # create stop table
        create_table(conn, sql_stop_table)

        if close_at_end: conn.close()
    else:
        print("Error! cannot create the database connection.")


###################################################################
#                                                                 #
#                         AUX FUNCTIONS                           #
#                                                                 #
###################################################################
def str_to_coords(coords_str:str):
    coords = coords_str.split(";")

    for i in range(len(coords)):
        coords[i] = list(map(float, coords[i].split(",")))
    
    return coords

def coords_to_str(coords:list):
    s = ""
    for coord in coords:
        s += str(coord)[1:-1] + ";" # lat0,lon1;lat1,lon1;lat2,lon2
    
    return s[:-1] # remove last ";"


###################################################################
#                                                                 #
#                            INSERTS                              #
#                                                                 #
###################################################################
def insert_bus_line(conn, bus_line_id, route:list):
    sql = ''' INSERT INTO line(id, route)
              VALUES(?, ?) '''
    cur = conn.cursor()
    route_str = coords_to_str(route)
    
    try:
        cur.execute(sql, (bus_line_id, route_str))
        conn.commit()
    except sqlite3.IntegrityError as e:
        return False
    
    return True


def insert_trip_schedule(conn, trip_id, bus_line_id, schedule:list):
    sql = ''' INSERT INTO trip_schedule(id, bus_line_id, schedule)
              VALUES(?, ?, ?) '''
    cur = conn.cursor()

    schedule_str = coords_to_str(schedule)

    try:
        cur.execute(sql, (trip_id, bus_line_id, schedule_str))    
        conn.commit()
    except sqlite3.IntegrityError as e:
        return False
    
    return True


def insert_stop(conn, stop_order, bus_line_id, coord:list):
    sql = ''' INSERT INTO stop(stop_order, bus_line_id, lat, lon)
              VALUES(?, ?, ?, ?) '''
    cur = conn.cursor()

    lat, lon = coord

    try:
        cur.execute(sql, (stop_order, bus_line_id, lat, lon))
        conn.commit()
    except sqlite3.IntegrityError as e:
        return False
    
    return True

###################################################################
#                                                                 #
#                            QUERIES                              #
#                                                                 #
###################################################################
def select_lines(conn):
    sql = ''' SELECT * FROM line '''
    cur = conn.cursor()
    cur.execute(sql)

    return cur.fetchall()


def select_line(conn, id):
    sql = ''' SELECT * FROM line WHERE id = ? '''
    cur = conn.cursor()
    cur.execute(sql, (id,))

    result = list(cur.fetchone()) # [id. route_str]
    
    coords_str = result[1]

    result[1] = str_to_coords(coords_str)

    return result


def select_route_of_line(conn, id):
    sql = ''' SELECT route FROM line WHERE id = ? '''
    cur = conn.cursor()
    cur.execute(sql, (id,))

    try:
        coords_str = cur.fetchone()[0]
        route = str_to_coords(coords_str)
    except TypeError as e:
        return None
    
    return route


def select_trip_schedule(conn, trip_id):
    sql = ''' SELECT schedule FROM trip_schedule WHERE id = ? '''
    cur = conn.cursor()
    cur.execute(sql, (trip_id,))

    return cur.fetchone()[0].split(";")


def select_stop_schedule(conn, next_stop, bus_line_id, trip_id):
    result = [None, None]
    
    sql = ''' SELECT lat,lon FROM stop WHERE stop_order = ? AND bus_line_id = ? '''
    cur = conn.cursor()
    cur.execute(sql, (next_stop, bus_line_id))

    result[0] = cur.fetchone()

    sql = ''' SELECT schedule FROM trip_schedule WHERE id = ? '''
    cur = conn.cursor()

    try:
        cur.execute(sql, (trip_id,))
        result[1] = cur.fetchone()[0].split(";")[next_stop-1]
    except TypeError as e:
        return None

    return result
    
    
def select_stops(conn, bus_line_id):    
    sql = ''' SELECT lat,lon,stop_order FROM stop WHERE bus_line_id = ? '''
    cur = conn.cursor()
    cur.execute(sql, (bus_line_id,))

    return cur.fetchall()
