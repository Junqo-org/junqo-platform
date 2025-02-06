import http.server
import logging
import sys

class RequestLoggerHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.log_request()
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Response from fake server")

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length else b''
        self.log_request(post_data)
        self.send_response(200)
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
        except ValueError:
            logging.error("Invalid port number. Using default port 3000")
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, RequestLoggerHandler)
    logging.info(f"Starting server on port {port}...")
    httpd.serve_forever()
