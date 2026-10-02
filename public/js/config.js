/**
 * Global Configuration for Hotel Booking System
 */
const CONFIG = {
    HOTEL_NAME: "Hotel Name",
    CURRENCY: "DZD",
    HOTEL_SERVICES: [
        "Free Wi-Fi",
        "Heating & air conditioning",
        "Free breakfast",
        "Free dinner"
    ],
    FLOOR_CAPACITIES: {
        1: 2,
        2: 3,
        3: 4,
        4: 5
    }
};

if (typeof window !== "undefined") {
    window.CONFIG = CONFIG;
}
