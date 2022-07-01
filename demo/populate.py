import os
import sys
import requests
import json
import datetime
from random import randint

DATA_DEMO_DIR = "./schedules_demo"
END_POINT = "http://localhost:3000/submit"

def generate_random_data(schedule, n):
    # Send the schedule to the DApp
    res = requests.post(END_POINT, json=schedule)
    if (res.status_code == 200):
        print(res.text)
    else:
        print(f"Error sending Schedule. Status code: {res.status_code}")
        return
    
    date = str(datetime.datetime.now()).split(" ")[0]
    bus_id = schedule["bus_id"]
    
    # generate random inputs using the schedule
    ## 1) Out of route
    detour = 0.03
    for i in range(n//2):
        random_route_coords_index = randint(0, len(schedule["route"])-1)

        lat, lon = schedule["route"][random_route_coords_index]

        is_lat = randint(0,1)
        if is_lat:
            lat += detour
        else:
            lon += detour

        trip = randint(0, len(schedule["schedule"])-1)
        trip_id = f"{bus_id};{trip + 1}"
        ts = f"{date} {schedule['schedule'][trip][0]}" # can be any ts

        obj = {
            "bus_id": bus_id,
            "trip_id": trip_id,
            "lat": lat,
            "lon": lon,
            "ts": ts
        }

        # Send it
        print(f"Sending POST (Out of Route) {i+1}:\n\t>> {obj}")
        res = requests.post(END_POINT, json=obj)

        if (res.status_code == 200):
            print(f"\t<< {res.text}")
        else:
            print(f"Error sending random input. Status code: {res.status_code}")
            break

    print("\n")
    ## 2) Late
    for i in range(n//2):
        random_stop_index = randint(0, len(schedule["stops"])-1)
        lat, lon = schedule["stops"][random_stop_index]
        
        trip = randint(0, len(schedule["schedule"])-1)
        trip_id = f"{bus_id};{trip + 1}"

        hour, minute, seconds = schedule['schedule'][trip][random_stop_index].split(":")
        time = f"{hour}:{minute}:{randint(10,59)}"
        ts = f"{date} {time}"
        
        obj = {
            "bus_id": bus_id,
            "trip_id": trip_id,
            "lat": lat,
            "lon": lon,
            "ts": ts
        }

        print(f"Sending POST (Late) {i+1}:\n\t>> {obj}")
        res = requests.post(END_POINT, json=obj)

        if (res.status_code == 200):
            print(f"\t<< {res.text}")
        else:
            print(f"Error sending random input. Status code: {res.status_code}")
            break
    
    print("===========================\n")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Missing argument: <number of random inputs for each schedule>")
    
    try:
        n = int(sys.argv[1])
    except:
        print("Argument must be an integer")
        sys.exit(1)
    
    for item in os.walk(DATA_DEMO_DIR):
        file_path = item[0]
        for filename in item[2]:
            print(filename, filename[-5:])
            if (filename[-5:] != ".json"):
                print(f"Error: expected JSON file, got {filename}!")
                continue
            
            full_filename = f"{file_path}/{filename}"
            print(f"Loading schedule: {file_path}/{filename}")
            with open(full_filename, "r") as schedule_file:
                schedule = json.load(schedule_file)
                generate_random_data(schedule, n)
            
