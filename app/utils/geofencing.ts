interface Location {
  latitude: number
  longitude: number
  radius: number // in meters
}

export function isWithinGeofence(userLocation: GeolocationPosition, workLocation: Location): boolean {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = userLocation.coords.latitude * Math.PI / 180
  const φ2 = workLocation.latitude * Math.PI / 180
  const Δφ = (workLocation.latitude - userLocation.coords.latitude) * Math.PI / 180
  const Δλ = (workLocation.longitude - userLocation.coords.longitude) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c

  return distance <= workLocation.radius
}

