"""
Builder Pattern - HTTP Request Builder Example
Constructs complex HTTP requests with optional parameters and validation
"""

from typing import Dict, List, Optional, Any
from enum import Enum

class HttpMethod(Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"

class HttpRequest:
    """Complex HTTP Request object - the product being built"""
    
    def __init__(self, builder):
        # Required parameters
        self.url = builder.url
        self.method = builder.method
        
        # Optional parameters
        self.headers = builder.headers.copy()
        self.query_params = builder.query_params.copy()
        self.body = builder.body
        self.timeout = builder.timeout
        self.retries = builder.retries
        self.auth = builder.auth
        self.cookies = builder.cookies.copy()
        self.follow_redirects = builder.follow_redirects
        self.verify_ssl = builder.verify_ssl
    
    def __str__(self):
        lines = [
            "HTTP Request Configuration:",
            f"├─ Method: {self.method.value}",
            f"├─ URL: {self.url}",
            f"├─ Headers: {len(self.headers)} headers",
        ]
        
        for key, value in self.headers.items():
            lines.append(f"│  ├─ {key}: {value}")
        
        lines.extend([
            f"├─ Query Params: {len(self.query_params)} parameters",
        ])
        
        for key, value in self.query_params.items():
            lines.append(f"│  ├─ {key}: {value}")
        
        lines.extend([
            f"├─ Body: {'Present' if self.body else 'None'}",
            f"├─ Timeout: {self.timeout}s",
            f"├─ Retries: {self.retries}",
            f"├─ Auth: {'Configured' if self.auth else 'None'}",
            f"├─ Cookies: {len(self.cookies)} cookies",
            f"├─ Follow Redirects: {self.follow_redirects}",
            f"└─ Verify SSL: {self.verify_ssl}"
        ])
        
        return "\n".join(lines)
    
    def execute(self):
        """Simulate executing the HTTP request"""
        print(f"🌐 Executing {self.method.value} request to {self.url}")
        
        if self.headers:
            print(f"📋 Headers: {', '.join(self.headers.keys())}")
        
        if self.query_params:
            query_string = '&'.join([f"{k}={v}" for k, v in self.query_params.items()])
            print(f"🔍 Query: ?{query_string}")
        
        if self.body:
            print(f"📦 Request body: {len(str(self.body))} characters")
        
        if self.auth:
            print(f"🔐 Authentication: {self.auth['type']}")
        
        print(f"⏱️  Timeout: {self.timeout}s, Retries: {self.retries}")
        print("✅ Request executed successfully!")

class HttpRequestBuilder:
    """Builder for creating HTTP requests with fluent interface"""
    
    def __init__(self, url: str, method: HttpMethod = HttpMethod.GET):
        # Required parameters
        self.url = url
        self.method = method
        
        # Optional parameters with defaults
        self.headers: Dict[str, str] = {}
        self.query_params: Dict[str, Any] = {}
        self.body: Optional[Any] = None
        self.timeout: int = 30
        self.retries: int = 3
        self.auth: Optional[Dict[str, Any]] = None
        self.cookies: Dict[str, str] = {}
        self.follow_redirects: bool = True
        self.verify_ssl: bool = True
    
    def header(self, name: str, value: str):
        """Add a single header"""
        self.headers[name] = value
        return self
    
    def headers(self, headers: Dict[str, str]):
        """Add multiple headers"""
        self.headers.update(headers)
        return self
    
    def content_type(self, content_type: str):
        """Convenience method for Content-Type header"""
        self.headers["Content-Type"] = content_type
        return self
    
    def json_content(self):
        """Set Content-Type to application/json"""
        return self.content_type("application/json")
    
    def form_content(self):
        """Set Content-Type to application/x-www-form-urlencoded"""
        return self.content_type("application/x-www-form-urlencoded")
    
    def query_param(self, name: str, value: Any):
        """Add a single query parameter"""
        self.query_params[name] = value
        return self
    
    def query_params(self, params: Dict[str, Any]):
        """Add multiple query parameters"""
        self.query_params.update(params)
        return self
    
    def json_body(self, data: Any):
        """Set JSON body and content type"""
        import json
        self.body = json.dumps(data)
        return self.json_content()
    
    def form_body(self, data: Dict[str, Any]):
        """Set form body and content type"""
        from urllib.parse import urlencode
        self.body = urlencode(data)
        return self.form_content()
    
    def raw_body(self, body: Any):
        """Set raw body content"""
        self.body = body
        return self
    
    def timeout(self, seconds: int):
        """Set request timeout"""
        if seconds <= 0:
            raise ValueError("Timeout must be positive")
        self.timeout = seconds
        return self
    
    def retries(self, count: int):
        """Set retry count"""
        if count < 0:
            raise ValueError("Retry count cannot be negative")
        self.retries = count
        return self
    
    def basic_auth(self, username: str, password: str):
        """Set basic authentication"""
        self.auth = {"type": "Basic", "username": username, "password": password}
        return self
    
    def bearer_token(self, token: str):
        """Set bearer token authentication"""
        self.auth = {"type": "Bearer", "token": token}
        self.headers["Authorization"] = f"Bearer {token}"
        return self
    
    def cookie(self, name: str, value: str):
        """Add a single cookie"""
        self.cookies[name] = value
        return self
    
    def cookies(self, cookies: Dict[str, str]):
        """Add multiple cookies"""
        self.cookies.update(cookies)
        return self
    
    def follow_redirects(self, follow: bool = True):
        """Set whether to follow redirects"""
        self.follow_redirects = follow
        return self
    
    def verify_ssl(self, verify: bool = True):
        """Set SSL verification"""
        self.verify_ssl = verify
        return self
    
    def build(self) -> HttpRequest:
        """Build and validate the HTTP request"""
        # Validation logic
        if not self.url:
            raise ValueError("URL is required")
        
        if not self.url.startswith(('http://', 'https://')):
            raise ValueError("URL must start with http:// or https://")
        
        if self.method in [HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH] and not self.body:
            print("⚠️  Warning: No body provided for", self.method.value, "request")
        
        # Add cookie header if cookies are present
        if self.cookies:
            cookie_string = '; '.join([f"{k}={v}" for k, v in self.cookies.items()])
            self.headers["Cookie"] = cookie_string
        
        return HttpRequest(self)

class HttpRequestDirector:
    """Director class providing common request configurations"""
    
    @staticmethod
    def json_api_request(url: str, method: HttpMethod = HttpMethod.GET):
        """Create a JSON API request with common headers"""
        return (HttpRequestBuilder(url, method)
                .json_content()
                .header("Accept", "application/json")
                .header("User-Agent", "HttpRequestBuilder/1.0")
                .timeout(15)
                .retries(2))
    
    @staticmethod
    def authenticated_api_request(url: str, token: str, method: HttpMethod = HttpMethod.GET):
        """Create an authenticated API request"""
        return (HttpRequestDirector.json_api_request(url, method)
                .bearer_token(token)
                .header("X-API-Version", "v1"))
    
    @staticmethod
    def form_submission(url: str, form_data: Dict[str, Any]):
        """Create a form submission request"""
        return (HttpRequestBuilder(url, HttpMethod.POST)
                .form_body(form_data)
                .header("User-Agent", "Mozilla/5.0 (compatible; FormBuilder)")
                .follow_redirects(True)
                .timeout(30))

def main():
    print("=== Builder Pattern Demo - HTTP Request Builder ===\n")
    
    # Example 1: Simple GET request
    print("1. Simple GET Request:")
    simple_request = (HttpRequestBuilder("https://api.github.com/user")
                     .header("User-Agent", "MyApp/1.0")
                     .timeout(10)
                     .build())
    
    print(simple_request)
    simple_request.execute()
    
    print("\n" + "="*60 + "\n")
    
    # Example 2: Complex POST request with JSON
    print("2. Complex JSON POST Request:")
    api_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "developer"
    }
    
    complex_request = (HttpRequestBuilder("https://api.example.com/users", HttpMethod.POST)
                      .json_body(api_data)
                      .bearer_token("abc123token")
                      .header("X-Client-Version", "2.1.0")
                      .query_param("format", "json")
                      .query_param("include", "profile")
                      .cookie("session_id", "xyz789")
                      .timeout(20)
                      .retries(5)
                      .build())
    
    print(complex_request)
    complex_request.execute()
    
    print("\n" + "="*60 + "\n")
    
    # Example 3: Using Director for common patterns
    print("3. Using Director for Common Patterns:")
    
    print("\nJSON API Request:")
    json_request = (HttpRequestDirector.json_api_request("https://api.example.com/data")
                   .query_params({"limit": 10, "offset": 0})
                   .build())
    print(json_request)
    
    print("\nAuthenticated API Request:")
    auth_request = (HttpRequestDirector.authenticated_api_request(
                       "https://api.example.com/protected", "my-secret-token")
                   .query_param("expand", "details")
                   .build())
    print(auth_request)
    
    print("\nForm Submission:")
    form_data = {"username": "user123", "password": "secret", "remember": "true"}
    form_request = HttpRequestDirector.form_submission("https://example.com/login", form_data).build()
    print(form_request)
    
    # Example 4: Validation
    print("\n" + "="*60 + "\n")
    print("4. Validation Examples:")
    
    try:
        invalid_request = HttpRequestBuilder("").build()
    except ValueError as e:
        print(f"❌ Build failed: {e}")
    
    try:
        invalid_url = HttpRequestBuilder("not-a-url").build()
    except ValueError as e:
        print(f"❌ Build failed: {e}")
    
    print("\n✅ Builder pattern successfully demonstrated!")
    print("Benefits: Fluent interface, parameter validation, method chaining, readability")

if __name__ == "__main__":
    main()
