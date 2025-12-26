import base64

def read_image_as_base64(upload_file):
    content = upload_file.file.read()
    return base64.b64encode(content).decode("utf-8")
