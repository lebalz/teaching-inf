# Micropython Network Device Decoder

Idea

- radio does not support ports, so we append a timestamp to the ethernet frame, which is used to filter out duplicates (e.g. when the same message is received multiple times due to retransmissions)
- The port-behavior is emulated by the timestamp, which is only added by switches or routers. This means that direct communication between two client devices is not possible, but all communication must go through a switch or router, which adds the timestamp to the frame.


Issues/Caveats
- Having two Switches/Routers on the same "Network" inside the reach of clients will caus issues, since packages will be flooded by both devices, which will cause doubled messages on the destination.