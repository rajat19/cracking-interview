"""
Object Pool Pattern - HTTP Connection Pool Example
Manages a pool of expensive HTTP connections for reuse, improving performance and resource management
"""

import threading
import time
import queue
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import weakref

class PoolableObject(ABC):
    """Abstract base class for objects that can be pooled"""
    
    @abstractmethod
    def reset(self) -> None:
        """Reset object state for reuse"""
        pass
    
    @abstractmethod
    def is_valid(self) -> bool:
        """Check if object is still valid for use"""
        pass
    
    @abstractmethod
    def get_id(self) -> str:
        """Get unique identifier for this object"""
        pass

class HTTPConnection(PoolableObject):
    """Poolable HTTP connection object"""
    
    def __init__(self, connection_id: str, base_url: str, timeout: int = 30):
        self.connection_id = connection_id
        self.base_url = base_url
        self.timeout = timeout
        self.created_at = datetime.now()
        self.last_used_at = datetime.now()
        self.request_count = 0
        self.session = None
        self.max_age = timedelta(minutes=10)  # Connection expires after 10 minutes
        self.max_requests = 100  # Connection expires after 100 requests
        
        self._initialize_session()
        print(f"🔗 Created new HTTP connection: {self.connection_id} -> {self.base_url}")
        
        # Simulate expensive connection setup
        time.sleep(0.1)
    
    def _initialize_session(self):
        """Initialize requests session with connection pooling"""
        self.session = requests.Session()
        
        # Configure session with connection pooling
        adapter = requests.adapters.HTTPAdapter(
            pool_connections=1,
            pool_maxsize=1,
            max_retries=3
        )
        self.session.mount('http://', adapter)
        self.session.mount('https://', adapter)
        
        # Set default headers
        self.session.headers.update({
            'User-Agent': f'PooledHTTPClient/{self.connection_id}',
            'Connection': 'keep-alive'
        })
    
    def reset(self) -> None:
        """Reset connection for reuse"""
        self.last_used_at = datetime.now()
        
        # Clear any session cookies or temporary state
        if self.session:
            self.session.cookies.clear()
        
        print(f"🔄 Reset HTTP connection: {self.connection_id}")
    
    def is_valid(self) -> bool:
        """Check if connection is still valid"""
        age = datetime.now() - self.created_at
        
        # Check age limit
        if age > self.max_age:
            print(f"⏰ Connection {self.connection_id} expired due to age: {age}")
            return False
        
        # Check request count limit
        if self.request_count >= self.max_requests:
            print(f"🔢 Connection {self.connection_id} expired due to request count: {self.request_count}")
            return False
        
        # Check if session is still alive
        if not self.session:
            print(f"💀 Connection {self.connection_id} has no active session")
            return False
        
        return True
    
    def get_id(self) -> str:
        return self.connection_id
    
    def get(self, endpoint: str, **kwargs) -> requests.Response:
        """Perform GET request"""
        return self._request('GET', endpoint, **kwargs)
    
    def post(self, endpoint: str, **kwargs) -> requests.Response:
        """Perform POST request"""
        return self._request('POST', endpoint, **kwargs)
    
    def put(self, endpoint: str, **kwargs) -> requests.Response:
        """Perform PUT request"""
        return self._request('PUT', endpoint, **kwargs)
    
    def delete(self, endpoint: str, **kwargs) -> requests.Response:
        """Perform DELETE request"""
        return self._request('DELETE', endpoint, **kwargs)
    
    def _request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Perform HTTP request"""
        if not self.is_valid():
            raise ValueError(f"Connection {self.connection_id} is not valid")
        
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        self.last_used_at = datetime.now()
        self.request_count += 1
        
        print(f"🌐 {method} request via {self.connection_id}: {endpoint}")
        
        # Set timeout if not provided
        if 'timeout' not in kwargs:
            kwargs['timeout'] = self.timeout
        
        try:
            response = self.session.request(method, url, **kwargs)
            print(f"✅ Request completed: {response.status_code} from {self.connection_id}")
            return response
        except Exception as e:
            print(f"❌ Request failed on {self.connection_id}: {e}")
            raise
    
    def close(self):
        """Close the connection"""
        if self.session:
            self.session.close()
            self.session = None
        print(f"🔌 Closed HTTP connection: {self.connection_id}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get connection status information"""
        age = datetime.now() - self.created_at
        idle_time = datetime.now() - self.last_used_at
        
        return {
            'id': self.connection_id,
            'base_url': self.base_url,
            'request_count': self.request_count,
            'age_seconds': int(age.total_seconds()),
            'idle_seconds': int(idle_time.total_seconds()),
            'is_valid': self.is_valid(),
            'created_at': self.created_at.strftime('%H:%M:%S'),
            'last_used_at': self.last_used_at.strftime('%H:%M:%S')
        }

@dataclass
class PoolStatistics:
    """Statistics for object pool"""
    available_count: int
    in_use_count: int
    total_count: int
    max_pool_size: int
    total_created: int
    total_acquired: int
    total_returned: int
    total_expired: int
    
    @property
    def utilization_percentage(self) -> float:
        return (self.total_count / self.max_pool_size) * 100 if self.max_pool_size > 0 else 0
    
    @property
    def reuse_percentage(self) -> float:
        return (self.total_returned / self.total_acquired) * 100 if self.total_acquired > 0 else 0
    
    def __str__(self) -> str:
        return f"""Pool Statistics:
├─ Available: {self.available_count}
├─ In Use: {self.in_use_count}
├─ Total: {self.total_count}/{self.max_pool_size} ({self.utilization_percentage:.1f}% utilization)
├─ Total Created: {self.total_created}
├─ Total Acquired: {self.total_acquired}
├─ Total Returned: {self.total_returned}
├─ Total Expired: {self.total_expired}
└─ Reuse Rate: {self.reuse_percentage:.1f}%"""

class ObjectPool:
    """Generic object pool implementation"""
    
    def __init__(self, factory, min_size: int = 2, max_size: int = 10, cleanup_interval: int = 30):
        self.factory = factory
        self.min_size = min_size
        self.max_size = max_size
        self.cleanup_interval = cleanup_interval
        
        # Pool management
        self._available = queue.Queue()
        self._in_use = set()
        self._lock = threading.RLock()
        self._condition = threading.Condition(self._lock)
        
        # Statistics
        self._total_created = 0
        self._total_acquired = 0
        self._total_returned = 0
        self._total_expired = 0
        
        # Cleanup thread
        self._cleanup_thread = None
        self._shutdown = False
        
        # Initialize pool
        self._initialize_pool()
        self._start_cleanup_thread()
        
        print(f"🏊 Object Pool initialized: min={min_size}, max={max_size}")
    
    def _initialize_pool(self):
        """Initialize pool with minimum number of objects"""
        for _ in range(self.min_size):
            obj = self.factory()
            self._available.put(obj)
            self._total_created += 1
        
        print(f"📦 Pool initialized with {self.min_size} objects")
    
    def _start_cleanup_thread(self):
        """Start background cleanup thread"""
        self._cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self._cleanup_thread.start()
    
    def _cleanup_loop(self):
        """Background cleanup loop"""
        while not self._shutdown:
            try:
                time.sleep(self.cleanup_interval)
                if not self._shutdown:
                    self._cleanup_expired_objects()
                    self._ensure_minimum_size()
            except Exception as e:
                print(f"⚠️  Cleanup error: {e}")
    
    def _cleanup_expired_objects(self):
        """Remove expired objects from the pool"""
        with self._lock:
            expired_objects = []
            
            # Check available objects
            temp_queue = queue.Queue()
            while not self._available.empty():
                try:
                    obj = self._available.get_nowait()
                    if obj.is_valid():
                        temp_queue.put(obj)
                    else:
                        expired_objects.append(obj)
                        self._total_expired += 1
                except queue.Empty:
                    break
            
            # Put back valid objects
            while not temp_queue.empty():
                self._available.put(temp_queue.get())
            
            # Close expired objects
            for obj in expired_objects:
                if hasattr(obj, 'close'):
                    obj.close()
            
            if expired_objects:
                print(f"🧹 Cleaned up {len(expired_objects)} expired objects")
    
    def _ensure_minimum_size(self):
        """Ensure pool has minimum number of objects"""
        with self._lock:
            current_total = self._available.qsize() + len(self._in_use)
            current_available = self._available.qsize()
            
            if current_available < self.min_size and current_total < self.max_size:
                to_create = min(
                    self.min_size - current_available,
                    self.max_size - current_total
                )
                
                for _ in range(to_create):
                    try:
                        obj = self.factory()
                        self._available.put(obj)
                        self._total_created += 1
                    except Exception as e:
                        print(f"❌ Error creating object during maintenance: {e}")
                        break
                
                if to_create > 0:
                    print(f"📈 Added {to_create} objects to maintain minimum pool size")
    
    def acquire(self, timeout: Optional[float] = None) -> PoolableObject:
        """Acquire an object from the pool"""
        start_time = time.time()
        
        with self._condition:
            while True:
                # Try to get an available object
                try:
                    obj = self._available.get_nowait()
                    if obj.is_valid():
                        self._in_use.add(obj)
                        self._total_acquired += 1
                        print(f"✅ Acquired object from pool: {obj.get_id()}")
                        return obj
                    else:
                        # Object expired
                        self._total_expired += 1
                        print(f"⏰ Object expired during acquire: {obj.get_id()}")
                        if hasattr(obj, 'close'):
                            obj.close()
                        continue
                except queue.Empty:
                    pass
                
                # No available objects, try to create new one
                current_total = self._available.qsize() + len(self._in_use)
                if current_total < self.max_size:
                    try:
                        obj = self.factory()
                        self._in_use.add(obj)
                        self._total_created += 1
                        self._total_acquired += 1
                        print(f"🆕 Created new object for immediate use: {obj.get_id()}")
                        return obj
                    except Exception as e:
                        print(f"❌ Error creating new object: {e}")
                        raise
                
                # Pool exhausted, wait or timeout
                if timeout is not None:
                    elapsed = time.time() - start_time
                    remaining = timeout - elapsed
                    if remaining <= 0:
                        raise TimeoutError("Timeout waiting for object from pool")
                    
                    print(f"⏳ Pool exhausted, waiting up to {remaining:.1f}s for available object...")
                    if not self._condition.wait(min(remaining, 1.0)):
                        continue  # Timeout on wait, check again
                else:
                    print("⏳ Pool exhausted, waiting for available object...")
                    self._condition.wait(1.0)  # Wait 1 second then retry
    
    def release(self, obj: PoolableObject) -> None:
        """Return an object to the pool"""
        if obj is None:
            return
        
        with self._lock:
            if obj in self._in_use:
                self._in_use.remove(obj)
                
                if obj.is_valid():
                    obj.reset()
                    self._available.put(obj)
                    self._total_returned += 1
                    print(f"🔄 Returned object to pool: {obj.get_id()}")
                    self._condition.notify()  # Notify waiting threads
                else:
                    self._total_expired += 1
                    print(f"⏰ Object expired on return: {obj.get_id()}")
                    if hasattr(obj, 'close'):
                        obj.close()
            else:
                print(f"⚠️  Attempted to return object not from this pool: {obj.get_id()}")
    
    def get_statistics(self) -> PoolStatistics:
        """Get current pool statistics"""
        with self._lock:
            return PoolStatistics(
                available_count=self._available.qsize(),
                in_use_count=len(self._in_use),
                total_count=self._available.qsize() + len(self._in_use),
                max_pool_size=self.max_size,
                total_created=self._total_created,
                total_acquired=self._total_acquired,
                total_returned=self._total_returned,
                total_expired=self._total_expired
            )
    
    def shutdown(self):
        """Shutdown the pool and cleanup resources"""
        print("🔚 Shutting down object pool...")
        
        self._shutdown = True
        
        if self._cleanup_thread and self._cleanup_thread.is_alive():
            self._cleanup_thread.join(timeout=5)
        
        with self._lock:
            # Close all objects
            while not self._available.empty():
                try:
                    obj = self._available.get_nowait()
                    if hasattr(obj, 'close'):
                        obj.close()
                except queue.Empty:
                    break
            
            for obj in list(self._in_use):
                if hasattr(obj, 'close'):
                    obj.close()
            
            self._in_use.clear()
        
        print(f"🔚 Pool shutdown completed. Final statistics:\n{self.get_statistics()}")

class HTTPService:
    """Service class that uses the HTTP connection pool"""
    
    def __init__(self, connection_pool: ObjectPool):
        self.connection_pool = connection_pool
    
    def make_request(self, endpoint: str, method: str = 'GET', **kwargs):
        """Make an HTTP request using a pooled connection"""
        connection = None
        try:
            connection = self.connection_pool.acquire(timeout=10)
            
            if method.upper() == 'GET':
                return connection.get(endpoint, **kwargs)
            elif method.upper() == 'POST':
                return connection.post(endpoint, **kwargs)
            elif method.upper() == 'PUT':
                return connection.put(endpoint, **kwargs)
            elif method.upper() == 'DELETE':
                return connection.delete(endpoint, **kwargs)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
        except Exception as e:
            print(f"❌ HTTP request failed: {e}")
            raise
        finally:
            if connection:
                self.connection_pool.release(connection)
    
    def batch_requests(self, requests_data: List[Dict[str, Any]]):
        """Perform multiple HTTP requests"""
        results = []
        
        for request_data in requests_data:
            try:
                endpoint = request_data.get('endpoint', '/')
                method = request_data.get('method', 'GET')
                params = request_data.get('params', {})
                
                result = self.make_request(endpoint, method, **params)
                results.append({'success': True, 'response': result})
                
            except Exception as e:
                results.append({'success': False, 'error': str(e)})
        
        return results

# Worker function for testing concurrent access
def http_worker(worker_id: int, http_service: HTTPService, request_count: int):
    """Worker function for concurrent HTTP requests"""
    print(f"🏃 Worker {worker_id} started")
    
    requests_data = [
        {'endpoint': f'users/{i}', 'method': 'GET'},
        {'endpoint': 'posts', 'method': 'POST', 'params': {'json': {'title': f'Post {i} from Worker {worker_id}'}}},
        {'endpoint': f'data/{i}', 'method': 'GET'}
    ]
    
    for i in range(request_count):
        try:
            request_data = requests_data[i % len(requests_data)]
            
            # Mock the actual request (since we don't have a real server)
            print(f"🔄 Worker {worker_id} making request {i+1}: {request_data['method']} {request_data['endpoint']}")
            
            # Simulate using the HTTP service
            connection = http_service.connection_pool.acquire()
            
            # Simulate request processing time
            time.sleep(0.1)
            
            print(f"✅ Worker {worker_id} completed request {i+1}")
            http_service.connection_pool.release(connection)
            
        except Exception as e:
            print(f"❌ Worker {worker_id} request {i+1} failed: {e}")
    
    print(f"✅ Worker {worker_id} completed all {request_count} requests")

def main():
    print("=== Object Pool Pattern Demo - HTTP Connection Pool ===\n")
    
    # Create HTTP connection pool
    def connection_factory():
        connection_id = f"http_conn_{int(time.time() * 1000)}_{threading.current_thread().ident}"
        return HTTPConnection(connection_id, "https://jsonplaceholder.typicode.com")
    
    # Note: Since we don't have a real HTTP server, we'll modify the example
    # to simulate the behavior without making actual HTTP requests
    
    pool = ObjectPool(connection_factory, min_size=2, max_size=6, cleanup_interval=10)
    
    print("\n1. Basic Pool Operations:")
    
    try:
        # Test basic acquire and release
        conn1 = pool.acquire()
        conn2 = pool.acquire()
        
        print(f"Acquired connections:")
        print(f"  Connection 1: {conn1.get_status()}")
        print(f"  Connection 2: {conn2.get_status()}")
        
        print(f"\nPool statistics after acquisition:")
        print(pool.get_statistics())
        
        # Simulate using connections (without actual HTTP requests)
        print(f"✅ Simulated request 1 on {conn1.get_id()}")
        conn1.request_count += 1
        conn1.last_used_at = datetime.now()
        
        print(f"✅ Simulated request 2 on {conn2.get_id()}")
        conn2.request_count += 1
        conn2.last_used_at = datetime.now()
        
        # Return connections to pool
        pool.release(conn1)
        pool.release(conn2)
        
        print(f"\nPool statistics after release:")
        print(pool.get_statistics())
        
    except Exception as e:
        print(f"Error in basic operations: {e}")
    
    print("\n2. HTTP Service Usage:")
    
    # Create HTTP service
    http_service = HTTPService(pool)
    
    # Simulate service usage
    for i in range(5):
        try:
            connection = pool.acquire()
            print(f"🌐 Simulated API call {i+1} using {connection.get_id()}")
            
            # Simulate request processing
            connection.request_count += 1
            connection.last_used_at = datetime.now()
            time.sleep(0.05)  # Simulate processing time
            
            pool.release(connection)
            
        except Exception as e:
            print(f"❌ Simulated request {i+1} failed: {e}")
    
    print(f"\nPool statistics after service usage:")
    print(pool.get_statistics())
    
    print("\n3. Concurrent Access Testing:")
    
    # Test with multiple threads
    worker_count = 4
    requests_per_worker = 3
    
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=worker_count) as executor:
        futures = []
        
        for i in range(worker_count):
            future = executor.submit(http_worker, i+1, http_service, requests_per_worker)
            futures.append(future)
        
        # Wait for all workers to complete
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Worker failed: {e}")
    
    end_time = time.time()
    
    print(f"\n⏱️  Concurrent operations completed in {end_time - start_time:.2f}s")
    
    print("\n4. Pool Statistics After Concurrent Testing:")
    stats = pool.get_statistics()
    print(stats)
    
    print("\n5. Pool Efficiency Analysis:")
    print(f"Pool Utilization: {stats.utilization_percentage:.1f}%")
    print(f"Object Reuse Rate: {stats.reuse_percentage:.1f}%")
    print(f"Average Requests per Object: {stats.total_acquired / stats.total_created:.1f}")
    
    print("\n6. Testing Pool Exhaustion:")
    
    # Acquire all connections and try to get one more
    held_connections = []
    try:
        # Acquire up to max pool size
        for i in range(6):  # max_size = 6
            conn = pool.acquire(timeout=2)
            held_connections.append(conn)
            print(f"Acquired connection {i+1}/6: {conn.get_id()}")
        
        print("Pool is now exhausted:")
        print(pool.get_statistics())
        
        # Try to acquire one more (should timeout)
        try:
            extra_conn = pool.acquire(timeout=2)
            print("ERROR: Should not have acquired extra connection!")
            pool.release(extra_conn)
        except TimeoutError as e:
            print(f"✅ Expected timeout: {e}")
    
    except Exception as e:
        print(f"Error during exhaustion test: {e}")
    
    finally:
        # Release all held connections
        for conn in held_connections:
            pool.release(conn)
    
    print("\n7. Pool After Releasing All Connections:")
    print(pool.get_statistics())
    
    print("\n8. Testing Object Expiration:")
    
    # Acquire a connection and simulate aging
    test_conn = pool.acquire()
    original_max_age = test_conn.max_age
    
    # Temporarily reduce max age for testing
    test_conn.max_age = timedelta(seconds=1)
    test_conn.created_at = datetime.now() - timedelta(seconds=2)  # Make it old
    
    print(f"Connection {test_conn.get_id()} is valid: {test_conn.is_valid()}")
    
    pool.release(test_conn)
    
    # Wait for cleanup
    print("Waiting for automatic cleanup...")
    time.sleep(2)
    
    print("Pool statistics after expiration cleanup:")
    print(pool.get_statistics())
    
    # Shutdown pool
    print("\n9. Pool Shutdown:")
    pool.shutdown()
    
    print("\n✅ Object Pool pattern successfully demonstrated!")
    print("Benefits: Resource reuse, performance optimization, controlled allocation, automatic cleanup")

if __name__ == "__main__":
    main()
