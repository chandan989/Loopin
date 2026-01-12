import math

# Constants
# 1 degree of latitude is approx 111km
# 1km is approx 0.009 degrees
SECTOR_SIZE_DEG = 0.009

def get_sector_base(lat: float, lng: float) -> tuple[float, float]:
    """
    Returns the Top-Left coordinate of the sector grid cell containing the given point.
    Essentially snaps the coordinate to the nearest grid line (floored).
    """
    sector_lat = math.floor(lat / SECTOR_SIZE_DEG) * SECTOR_SIZE_DEG
    sector_lng = math.floor(lng / SECTOR_SIZE_DEG) * SECTOR_SIZE_DEG
    return sector_lat, sector_lng

def get_sector_offset(lat: float, lng: float) -> tuple[float, float]:
    """
    Returns the relative offset of the point within its sector.
    """
    sector_base_lat, sector_base_lng = get_sector_base(lat, lng)
    return lat - sector_base_lat, lng - sector_base_lng

def project_to_observer(obs_lat: float, obs_lng: float, target_lat: float, target_lng: float) -> tuple[float, float]:
    """
    Projects a target's position into the observer's virtual sector.
    
    The target appears at the same relative position within the observer's sector
    as they are in their own sector.
    """
    # 1. Get Observer's Sector Base
    obs_base_lat, obs_base_lng = get_sector_base(obs_lat, obs_lng)
    
    # 2. Get Target's Offset within their own sector
    target_offset_lat, target_offset_lng = get_sector_offset(target_lat, target_lng)
    
    # 3. Combine to project Target into Observer's frame of reference
    projected_lat = obs_base_lat + target_offset_lat
    projected_lng = obs_base_lng + target_offset_lng
    
    return projected_lat, projected_lng
