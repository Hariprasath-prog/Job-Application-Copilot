from mcp.server.fastmcp import FastMCP
import httpx

mcp = FastMCP("Weather Server")


@mcp.tool()
async def get_weather(latitude: float, longitude: float) -> str:
    """
    Get the current weather for a location using latitude and longitude.
    """

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,wind_speed_10m,relative_humidity_2m",
        "timezone": "auto"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    response.raise_for_status()

    data = response.json()

    current = data["current"]

    temperature = current["temperature_2m"]
    wind_speed = current["wind_speed_10m"]
    humidity = current["relative_humidity_2m"]

    return (
        f"Temperature: {temperature}°C\n"
        f"Wind Speed: {wind_speed} km/h\n"
        f"Humidity: {humidity}%"
    )


if __name__ == "__main__":
    mcp.run()