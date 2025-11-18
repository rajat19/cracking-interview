"""
Singleton Pattern - Configuration Manager System
Ensures only one instance of the configuration manager exists with thread safety and lazy initialization
"""

import threading
import json
import os
import time
from datetime import datetime
from typing import Dict, Any, Optional
from enum import Enum

class ConfigurationManager:
    """Thread-safe Singleton Configuration Manager"""
    
    _instance = None
    _lock = threading.Lock()
    
    class Environment(Enum):
        DEVELOPMENT = "development"
        STAGING = "staging"
        PRODUCTION = "production"
        
    def __new__(cls):
        # Thread-safe singleton implementation using double-checked locking
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(ConfigurationManager, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        # Ensure initialization happens only once
        if self._initialized:
            return
            
        with self._lock:
            if self._initialized:
                return
                
            # Initialize configuration state
            self._config_data: Dict[str, Any] = {}
            self._environment = self.Environment.DEVELOPMENT
            self._config_file_path = "config.json"
            self._last_modified = None
            self._access_count = 0
            self._access_history = []
            self._watchers = []
            
            # Load default configuration
            self._load_default_config()
            self._initialized = True
            
            print(f"🔧 ConfigurationManager initialized on thread: {threading.current_thread().name}")
    
    def _load_default_config(self):
        """Load default configuration values"""
        self._config_data = {
            "app": {
                "name": "MyApplication",
                "version": "1.0.0",
                "debug": True
            },
            "database": {
                "host": "localhost",
                "port": 5432,
                "name": "myapp_db",
                "pool_size": 10,
                "timeout": 30
            },
            "cache": {
                "enabled": True,
                "ttl": 3600,
                "max_size": 1000
            },
            "logging": {
                "level": "INFO",
                "file_enabled": True,
                "console_enabled": True
            },
            "security": {
                "jwt_expiry": 86400,
                "password_min_length": 8,
                "rate_limit": 100
            }
        }
        self._last_modified = datetime.now()
    
    @classmethod
    def get_instance(cls) -> 'ConfigurationManager':
        """Get the singleton instance"""
        return cls()
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by key (supports dot notation)"""
        with self._lock:
            self._access_count += 1
            self._access_history.append({
                'key': key,
                'timestamp': datetime.now(),
                'thread': threading.current_thread().name
            })
            
            # Support dot notation (e.g., "database.host")
            keys = key.split('.')
            value = self._config_data
            
            try:
                for k in keys:
                    value = value[k]
                return value
            except (KeyError, TypeError):
                return default
    
    def set(self, key: str, value: Any) -> None:
        """Set configuration value by key (supports dot notation)"""
        with self._lock:
            keys = key.split('.')
            config = self._config_data
            
            # Navigate to the parent dictionary
            for k in keys[:-1]:
                if k not in config:
                    config[k] = {}
                config = config[k]
            
            # Set the final value
            old_value = config.get(keys[-1])
            config[keys[-1]] = value
            self._last_modified = datetime.now()
            
            print(f"🔄 Config updated: {key} = {value} (was: {old_value})")
            
            # Notify watchers
            self._notify_watchers(key, old_value, value)
    
    def get_section(self, section: str) -> Dict[str, Any]:
        """Get entire configuration section"""
        return self.get(section, {})
    
    def set_environment(self, environment: Environment) -> None:
        """Set application environment and adjust configurations accordingly"""
        with self._lock:
            old_env = self._environment
            self._environment = environment
            
            # Adjust configurations based on environment
            if environment == self.Environment.PRODUCTION:
                self.set("app.debug", False)
                self.set("logging.level", "WARN")
                self.set("database.pool_size", 50)
                self.set("security.rate_limit", 1000)
            elif environment == self.Environment.STAGING:
                self.set("app.debug", False)
                self.set("logging.level", "INFO")
                self.set("database.pool_size", 20)
            else:  # DEVELOPMENT
                self.set("app.debug", True)
                self.set("logging.level", "DEBUG")
                self.set("database.pool_size", 5)
            
            print(f"🌍 Environment changed from {old_env.value} to {environment.value}")
    
    def get_environment(self) -> Environment:
        """Get current environment"""
        return self._environment
    
    def load_from_file(self, file_path: str) -> bool:
        """Load configuration from JSON file"""
        try:
            with self._lock:
                if os.path.exists(file_path):
                    with open(file_path, 'r') as file:
                        file_config = json.load(file)
                        self._merge_config(file_config)
                        self._config_file_path = file_path
                        self._last_modified = datetime.now()
                        print(f"📁 Configuration loaded from {file_path}")
                        return True
                else:
                    print(f"⚠️  Configuration file not found: {file_path}")
                    return False
        except Exception as e:
            print(f"❌ Error loading configuration: {e}")
            return False
    
    def save_to_file(self, file_path: Optional[str] = None) -> bool:
        """Save current configuration to JSON file"""
        try:
            with self._lock:
                path = file_path or self._config_file_path
                with open(path, 'w') as file:
                    json.dump(self._config_data, file, indent=2, default=str)
                    print(f"💾 Configuration saved to {path}")
                    return True
        except Exception as e:
            print(f"❌ Error saving configuration: {e}")
            return False
    
    def _merge_config(self, new_config: Dict[str, Any]) -> None:
        """Merge new configuration with existing one"""
        def merge_dicts(base: Dict, update: Dict):
            for key, value in update.items():
                if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                    merge_dicts(base[key], value)
                else:
                    base[key] = value
        
        merge_dicts(self._config_data, new_config)
    
    def add_watcher(self, callback) -> None:
        """Add a callback to be notified when configuration changes"""
        with self._lock:
            self._watchers.append(callback)
            print(f"👁️  Added configuration watcher: {callback.__name__}")
    
    def remove_watcher(self, callback) -> None:
        """Remove a configuration watcher"""
        with self._lock:
            if callback in self._watchers:
                self._watchers.remove(callback)
                print(f"👁️  Removed configuration watcher: {callback.__name__}")
    
    def _notify_watchers(self, key: str, old_value: Any, new_value: Any) -> None:
        """Notify all watchers about configuration changes"""
        for callback in self._watchers:
            try:
                callback(key, old_value, new_value)
            except Exception as e:
                print(f"⚠️  Error in watcher {callback.__name__}: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get configuration manager statistics"""
        with self._lock:
            return {
                "environment": self._environment.value,
                "config_file": self._config_file_path,
                "last_modified": self._last_modified.isoformat() if self._last_modified else None,
                "access_count": self._access_count,
                "total_configs": self._count_configs(self._config_data),
                "active_watchers": len(self._watchers),
                "thread_id": threading.current_thread().name
            }
    
    def _count_configs(self, config: Dict[str, Any]) -> int:
        """Recursively count configuration entries"""
        count = 0
        for value in config.values():
            if isinstance(value, dict):
                count += self._count_configs(value)
            else:
                count += 1
        return count
    
    def get_access_history(self, limit: int = 10) -> list:
        """Get recent configuration access history"""
        with self._lock:
            return self._access_history[-limit:] if self._access_history else []
    
    def reload(self) -> None:
        """Reload configuration from file"""
        if self._config_file_path:
            self.load_from_file(self._config_file_path)
    
    def reset_to_defaults(self) -> None:
        """Reset configuration to default values"""
        with self._lock:
            old_config = self._config_data.copy()
            self._load_default_config()
            print("🔄 Configuration reset to defaults")
            
            # Notify watchers about the reset
            for callback in self._watchers:
                try:
                    callback("__reset__", old_config, self._config_data)
                except Exception as e:
                    print(f"⚠️  Error in watcher during reset: {e}")
    
    def __str__(self) -> str:
        """String representation of configuration"""
        return json.dumps(self._config_data, indent=2, default=str)

# Example classes demonstrating configuration usage
class DatabaseService:
    """Example service using configuration"""
    
    def __init__(self):
        self.config = ConfigurationManager.get_instance()
        self.connection = None
        
    def connect(self):
        """Connect to database using configuration"""
        host = self.config.get("database.host", "localhost")
        port = self.config.get("database.port", 5432)
        db_name = self.config.get("database.name", "default")
        pool_size = self.config.get("database.pool_size", 10)
        timeout = self.config.get("database.timeout", 30)
        
        print(f"🗄️  Connecting to database: {host}:{port}/{db_name}")
        print(f"   Pool size: {pool_size}, Timeout: {timeout}s")
        
        # Simulate connection
        time.sleep(0.1)
        self.connection = f"Connected to {host}:{port}/{db_name}"
        print("✅ Database connected successfully")
        
    def get_connection_info(self) -> str:
        return self.connection or "Not connected"

class CacheService:
    """Example cache service using configuration"""
    
    def __init__(self):
        self.config = ConfigurationManager.get_instance()
        self.cache = {}
        
    def initialize(self):
        """Initialize cache with configuration settings"""
        enabled = self.config.get("cache.enabled", True)
        ttl = self.config.get("cache.ttl", 3600)
        max_size = self.config.get("cache.max_size", 1000)
        
        if enabled:
            print(f"🧠 Initializing cache: TTL={ttl}s, Max size={max_size}")
            self.cache = {"ttl": ttl, "max_size": max_size, "entries": {}}
        else:
            print("🚫 Cache disabled by configuration")
            
    def get_cache_info(self) -> Dict[str, Any]:
        return self.cache

class LoggerService:
    """Example logger service using configuration"""
    
    def __init__(self):
        self.config = ConfigurationManager.get_instance()
        
    def setup_logging(self):
        """Setup logging based on configuration"""
        level = self.config.get("logging.level", "INFO")
        file_enabled = self.config.get("logging.file_enabled", True)
        console_enabled = self.config.get("logging.console_enabled", True)
        
        print(f"📝 Setting up logging: Level={level}")
        print(f"   File output: {'Enabled' if file_enabled else 'Disabled'}")
        print(f"   Console output: {'Enabled' if console_enabled else 'Disabled'}")

# Configuration change watcher example
def config_change_watcher(key: str, old_value: Any, new_value: Any):
    """Example configuration change watcher"""
    print(f"🔔 Config change detected: {key} changed from {old_value} to {new_value}")

# Thread worker to test thread safety
def config_worker(worker_id: int, operation_count: int):
    """Worker function to test thread safety"""
    config = ConfigurationManager.get_instance()
    
    for i in range(operation_count):
        # Read operations
        app_name = config.get("app.name")
        db_host = config.get("database.host")
        
        # Write operations (with unique values per worker)
        config.set(f"worker_{worker_id}.counter", i)
        config.set(f"worker_{worker_id}.timestamp", datetime.now().isoformat())
        
        time.sleep(0.01)  # Small delay to allow thread interleaving
    
    print(f"✅ Worker {worker_id} completed {operation_count} operations")

def main():
    print("=== Singleton Pattern Demo - Configuration Manager ===\n")
    
    # Demonstrate singleton behavior
    print("1. Demonstrating Singleton Behavior:")
    config1 = ConfigurationManager.get_instance()
    config2 = ConfigurationManager()
    config3 = ConfigurationManager.get_instance()
    
    print(f"config1 is config2: {config1 is config2}")
    print(f"config1 is config3: {config1 is config3}")
    print(f"Instance ID: {id(config1)}")
    
    # Basic configuration operations
    print("\n2. Basic Configuration Operations:")
    config = ConfigurationManager.get_instance()
    
    print(f"App name: {config.get('app.name')}")
    print(f"Database host: {config.get('database.host')}")
    print(f"Non-existent key: {config.get('non.existent', 'default_value')}")
    
    # Set new values
    config.set("app.version", "2.0.0")
    config.set("new.feature.enabled", True)
    print(f"Updated app version: {config.get('app.version')}")
    
    # Environment switching
    print("\n3. Environment Management:")
    print(f"Current environment: {config.get_environment().value}")
    
    config.set_environment(ConfigurationManager.Environment.PRODUCTION)
    print(f"Debug mode after production switch: {config.get('app.debug')}")
    print(f"Database pool size: {config.get('database.pool_size')}")
    
    config.set_environment(ConfigurationManager.Environment.DEVELOPMENT)
    print(f"Debug mode after development switch: {config.get('app.debug')}")
    
    # Configuration watchers
    print("\n4. Configuration Watchers:")
    config.add_watcher(config_change_watcher)
    
    config.set("test.value", "initial")
    config.set("test.value", "updated")
    config.set("test.another", "new_value")
    
    # Services using configuration
    print("\n5. Services Using Configuration:")
    
    db_service = DatabaseService()
    db_service.connect()
    print(f"Connection: {db_service.get_connection_info()}")
    
    cache_service = CacheService()
    cache_service.initialize()
    print(f"Cache info: {cache_service.get_cache_info()}")
    
    logger_service = LoggerService()
    logger_service.setup_logging()
    
    # Thread safety demonstration
    print("\n6. Thread Safety Demonstration:")
    
    threads = []
    thread_count = 5
    operations_per_thread = 10
    
    start_time = time.time()
    
    # Create and start threads
    for i in range(thread_count):
        thread = threading.Thread(
            target=config_worker, 
            args=(i, operations_per_thread)
        )
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    end_time = time.time()
    
    print(f"⏱️  Thread test completed in {end_time - start_time:.2f}s")
    
    # Statistics and history
    print("\n7. Configuration Statistics:")
    stats = config.get_statistics()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    print("\nRecent access history:")
    history = config.get_access_history(5)
    for access in history:
        print(f"  {access['timestamp']}: {access['key']} (thread: {access['thread']})")
    
    # File operations
    print("\n8. File Operations:")
    
    # Save current configuration
    config.save_to_file("demo_config.json")
    
    # Modify and reload
    config.set("temp.value", "temporary")
    print(f"Temp value before reload: {config.get('temp.value')}")
    
    config.reload()
    print(f"Temp value after reload: {config.get('temp.value', 'Not found')}")
    
    # Configuration sections
    print("\n9. Configuration Sections:")
    database_config = config.get_section("database")
    print("Database configuration:")
    for key, value in database_config.items():
        print(f"  {key}: {value}")
    
    # Reset demonstration
    print("\n10. Reset to Defaults:")
    total_configs_before = config.get_statistics()["total_configs"]
    config.reset_to_defaults()
    total_configs_after = config.get_statistics()["total_configs"]
    
    print(f"Configs before reset: {total_configs_before}")
    print(f"Configs after reset: {total_configs_after}")
    
    # Cleanup
    config.remove_watcher(config_change_watcher)
    
    print(f"\n✅ Singleton pattern successfully demonstrated!")
    print("Benefits: Single instance, thread safety, global configuration, change notification")
    
    # Final statistics
    final_stats = config.get_statistics()
    print(f"\nFinal access count: {final_stats['access_count']}")

if __name__ == "__main__":
    main()
