// Temporary static mapping for system design code files
// This will be replaced with dynamic loading once we fix the glob issue

export const systemDesignCodeMap = {
  'library-management': {
    'accounts.java': () => import('../content/system-design/code/library-management/accounts.java?raw'),
    'accounts.py': () => import('../content/system-design/code/library-management/accounts.py?raw'),
    'book.java': () => import('../content/system-design/code/library-management/book.java?raw'),
    'book.py': () => import('../content/system-design/code/library-management/book.py?raw'),
    'enums.java': () => import('../content/system-design/code/library-management/enums.java?raw'),
    'enums.py': () => import('../content/system-design/code/library-management/enums.py?raw'),
    'reservation.java': () => import('../content/system-design/code/library-management/reservation.java?raw'),
    'reservation.py': () => import('../content/system-design/code/library-management/reservation.py?raw'),
    'search.java': () => import('../content/system-design/code/library-management/search.java?raw'),
    'search.py': () => import('../content/system-design/code/library-management/search.py?raw'),
  },
  'parking-lot': {
    'accounts.java': () => import('../content/system-design/code/parking-lot/accounts.java?raw'),
    'accounts.py': () => import('../content/system-design/code/parking-lot/accounts.py?raw'),
    'enums.java': () => import('../content/system-design/code/parking-lot/enums.java?raw'),
    'enums.py': () => import('../content/system-design/code/parking-lot/enums.py?raw'),
    'parkingDisplay.java': () => import('../content/system-design/code/parking-lot/parkingDisplay.java?raw'),
    'parkingDisplay.py': () => import('../content/system-design/code/parking-lot/parkingDisplay.py?raw'),
    'parkingFloor.java': () => import('../content/system-design/code/parking-lot/parkingFloor.java?raw'),
    'parkingFloor.py': () => import('../content/system-design/code/parking-lot/parkingFloor.py?raw'),
    'parkingLot.java': () => import('../content/system-design/code/parking-lot/parkingLot.java?raw'),
    'parkingLot.py': () => import('../content/system-design/code/parking-lot/parkingLot.py?raw'),
    'parkingSpot.java': () => import('../content/system-design/code/parking-lot/parkingSpot.java?raw'),
    'parkingSpot.py': () => import('../content/system-design/code/parking-lot/parkingSpot.py?raw'),
    'vehicle.java': () => import('../content/system-design/code/parking-lot/vehicle.java?raw'),
    'vehicle.py': () => import('../content/system-design/code/parking-lot/vehicle.py?raw'),
  },
  // Add other designs as needed
};
