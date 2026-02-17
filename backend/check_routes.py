from main import app

def list_routes():
    print("Registered Routes:")
    for route in app.routes:
        methods = ", ".join(route.methods)
        print(f"{methods} -> {route.path}")

if __name__ == "__main__":
    list_routes()
