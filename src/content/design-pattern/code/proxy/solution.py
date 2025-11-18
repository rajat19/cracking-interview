import time
from abc import ABC, abstractmethod
from typing import Dict, Set, Optional

# Subject interface
class ImageViewer(ABC):
    @abstractmethod
    def display_image(self) -> None:
        pass
    
    @abstractmethod
    def get_image_info(self) -> str:
        pass

# Real Subject - Heavy image that takes time to load
class HighResolutionImage(ImageViewer):
    def __init__(self, filename: str):
        self.filename = filename
        self.file_size = int(__import__('random').randint(5000, 15000))  # Random file size
        self.image_data = None
        self._load_image_from_disk()  # Expensive operation

    def _load_image_from_disk(self) -> None:
        print(f"Loading high-resolution image: {self.filename}")
        print(f"File size: {self.file_size} KB")
        
        # Simulate time-consuming loading process
        time.sleep(2)  # Simulate 2 seconds loading time
        
        self.image_data = f"Raw image data for {self.filename}"
        print("✓ Image loaded successfully!")

    def display_image(self) -> None:
        print(f"🖼️  Displaying: {self.filename}")
        print(f"   Resolution: 4K Ultra HD")
        print(f"   Size: {self.file_size} KB")

    def get_image_info(self) -> str:
        return f"{self.filename} ({self.file_size} KB)"

# Proxy - Controls access and provides additional functionality
class ImageProxy(ImageViewer):
    _image_cache: Dict[str, HighResolutionImage] = {}
    _access_log: Set[str] = set()

    def __init__(self, filename: str, user_role: str):
        self.filename = filename
        self.user_role = user_role
        self.real_image: Optional[HighResolutionImage] = None

    def _get_real_image(self) -> HighResolutionImage:
        if self.real_image is None:
            # Check cache first
            if self.filename in ImageProxy._image_cache:
                print(f"📋 Loading from cache: {self.filename}")
                self.real_image = ImageProxy._image_cache[self.filename]
            else:
                # Load from disk and cache it
                self.real_image = HighResolutionImage(self.filename)
                ImageProxy._image_cache[self.filename] = self.real_image
                print("💾 Image cached for future use")
        return self.real_image

    def display_image(self) -> None:
        # Access control
        if not self._has_access():
            print(f"❌ Access denied! User role '{self.user_role}' cannot view: {self.filename}")
            return

        # Logging
        self._log_access()
        
        # Additional functionality before delegation
        print(f"🔍 Proxy: Preparing to display {self.filename}")
        
        # Lazy loading and delegation to real object
        image = self._get_real_image()
        image.display_image()
        
        # Additional functionality after delegation
        print("📊 Proxy: Display completed, updating view statistics")

    def get_image_info(self) -> str:
        # Some info can be provided without loading the actual image
        if self.real_image is None and self.filename not in ImageProxy._image_cache:
            return f"{self.filename} (not loaded yet)"
        else:
            return self._get_real_image().get_image_info()

    def _has_access(self) -> bool:
        # Simple role-based access control
        if "confidential" in self.filename and self.user_role != "admin":
            return False
        if "premium" in self.filename and self.user_role == "guest":
            return False
        return True

    def _log_access(self) -> None:
        log_entry = f"{self.user_role} accessed {self.filename}"
        ImageProxy._access_log.add(log_entry)
        print(f"📝 Access logged: {log_entry}")

    @classmethod
    def print_access_log(cls) -> None:
        print("\n=== ACCESS LOG ===")
        for entry in cls._access_log:
            print(f"  {entry}")
        print("==================\n")

    @classmethod
    def print_cache_status(cls) -> None:
        print("=== CACHE STATUS ===")
        print(f"Images in cache: {len(cls._image_cache)}")
        for filename in cls._image_cache.keys():
            print(f"  - {filename}")
        print("===================\n")

def main():
    print("=== PROXY PATTERN DEMO ===\n")

    # Create image proxies for different users
    images = [
        ImageProxy("nature_landscape.jpg", "user"),
        ImageProxy("confidential_document.jpg", "user"),
        ImageProxy("premium_photo.jpg", "guest"),
        ImageProxy("vacation_photo.jpg", "admin"),
        ImageProxy("confidential_blueprint.jpg", "admin")
    ]

    print("1. INITIAL ACCESS - Images not loaded yet")
    print("Getting image info (lightweight operation):")
    for image in images:
        print(f"  - {image.get_image_info()}")

    print("\n2. FIRST DISPLAY ATTEMPTS")
    print("Now attempting to display images (heavy operation):\n")
    
    for image in images:
        print("--- Attempting to display ---")
        image.display_image()
        print()

    print("3. SECOND ACCESS - Should use cache")
    print("Displaying the first image again (should be faster):\n")
    images[0].display_image()

    print("\n4. PROXY FEATURES DEMONSTRATION")
    ImageProxy.print_access_log()
    ImageProxy.print_cache_status()

    print("=== PROXY BENEFITS ===")
    print("✓ Lazy Loading: Images only loaded when displayed")
    print("✓ Caching: Subsequent access is faster")
    print("✓ Access Control: Role-based permissions enforced")
    print("✓ Logging: All access attempts are logged")
    print("✓ Transparent: Client code doesn't know about proxy")

if __name__ == "__main__":
    main()
