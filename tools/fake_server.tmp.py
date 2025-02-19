import http.server
import logging
import sys
import json

"""
This is a simple test purpose server that logs and debugs HTTP requests.

The server listens on a specified port (default is 4200) and handles GET and POST requests.
For GET requests, it responds with a plain text message "Response from fake server".
For POST requests, it expects the content type to be JSON and the body size to be less than 1MB.
If the request is valid, it responds with "Received POST request".

All requests are logged with details including the request method, path, headers, and body (for POST requests).
The logs are output to the console for debugging purposes.
"""


class RequestLoggerHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.log_request()
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Response from fake server")

    def do_POST(self):
        if self.headers.get('Content-Type') != 'application/json':
            self.send_error(415, "Only JSON is supported")
            return
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 1024 * 1024:  # 1MB limit
            self.send_error(413, "Request entity too large")
            return
        post_data = self.rfile.read(content_length) if content_length else b''
        try:
            post_data = post_data.decode('utf-8')
            post_data = json.loads(post_data)
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
            return
        self.log_request(post_data)
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Received POST request")

    def log_request(self, body=b''):
        logging.info(f"Received {self.command} request")
        logging.info(f"Path: {self.path}")
        logging.info(f"Headers:\n{self.headers}")
        if body:
            logging.info(f"Body: {body}")


if __name__ == "__main__":
    args = sys.argv[1:]
    port = 4200
    if args:
        try:
            port = int(args[0])
            if port < 1024 or port > 65535:
                raise ValueError("Port must be between 1024 and 65535")
        except ValueError:
            logging.error(f"Invalid port number. Using default port {port}")
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, RequestLoggerHandler)
    logging.info(f"Starting server on port {port}...")
    httpd.serve_forever()
