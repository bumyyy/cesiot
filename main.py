from ast import pattern
from email.mime import message
import re
import paho.mqtt.client as mqtt
import requests

open_count = 0
current_temp = None
doors = {}

def send_alert(message):
    url = "https://ntfy.perseusflix.fr/cesiot"
    response = requests.post(url, data=message.encode(),
        headers={
        "Authorization": "Bearer tk_2nhijkwmkoq6m2bz042ra3nuuktlj"
    })
    print(response.status_code, response.text)

def get_door_id(topic):
    m = re.match(r"^refectory/door/([^/]+)/", topic)
    if m:
        return m.group(1)

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected with result code {reason_code}")
    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe("refectory/#")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))

    topic = msg.topic
    payload = msg.payload.decode()

    door_id = get_door_id(topic)
    if door_id is None:
        return

    if door_id not in doors:
        doors[door_id] = {"temp": None, "state": None, "open_count": 0}

    door = doors[door_id]

    if re.match(r"^refectory/door/[^/]+/temperature$", topic):
        door["temp"] = float(payload)

    if re.match(r"^refectory/door/[^/]+/state$", topic):
        if payload == "1":   # closed
            if door["open_count"] >= 5:
                print(f"[{door_id}] INFO: porte refermee.")
                send_alert(f"Porte {door_id} refermee.")
            door["open_count"] = 0

        elif payload == "0": # open
            if door["temp"] is not None and (door["temp"] < 18 or door["temp"] > 25):
                door["open_count"] += 1
                if door["open_count"] == 5:
                    print(f"[{door_id}] ALERTE: porte ouverte trop longtemps !")
                    send_alert(f"Porte {door_id} ouverte trop longtemps !")

mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.on_connect = on_connect
mqttc.on_message = on_message

mqttc.connect("192.168.50.1", 1883, 60)

# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
mqttc.loop_forever()

