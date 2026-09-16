"""
SMARTGATE AI - Local Development & Presentation Server
Runs a local HTTP server on port 8000 and optionally opens the browser.
"""

import http.server
import socketserver
import webbrowser
import sys
import os

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching for local presentation development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    # Change working directory to script location
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    Handler = CustomHTTPRequestHandler
    
    # Allow socket reuse so restarts don't hit port collision
    socketserver.TCPServer.allow_reuse_address = True

    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            url = f"http://localhost:{PORT}"
            print("=" * 60)
            print("🚀 SMARTGATE AI - Server Running")
            print("   AI-Powered Smart Student Entry & Exit Management System")
            print("=" * 60)
            print(f"📡 Access URL: {url}")
            print(f"📁 Root Dir  : {os.getcwd()}")
            print("Press Ctrl+C to stop the server.\n")
            
            # Open browser automatically if run directly
            if "--no-browser" not in sys.argv:
                try:
                    webbrowser.open(url)
                except Exception as e:
                    print(f"Could not open browser automatically: {e}")

            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 SMARTGATE AI server stopped.")
    except Exception as e:
        print(f"\n❌ Error launching server: {e}")

if __name__ == "__main__":
    main()
