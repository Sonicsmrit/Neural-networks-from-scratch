from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image, ImageFilter
import base64, io

W1 = np.load("mnist-backend\weights\W1.npy")
W2 = np.load("mnist-backend\weights\W2.npy")
W3 = np.load("mnist-backend\weights\W3.npy")

b1 = np.load("mnist-backend\weights/b1.npy")
b2 = np.load("mnist-backend\weights/b2.npy")
b3 = np.load("mnist-backend\weights/b3.npy")

def Softmax(Z):
    exp_Z = np.exp(Z - np.max(Z, axis=0, keepdims=True))
    sum_exp = np.sum(exp_Z, axis=0, keepdims=True)

    return exp_Z / sum_exp


def forward_pass(X):
    ##layer 1
    Z1 = W1@X+b1 ##raw linear output

    #ReLU
    A1 = np.maximum(0, Z1) ##activation function

    ##layer 2
    Z2 = W2@A1 + b2

    A2 = np.maximum(0, Z2) 

    ##layer 3

    Z3 = W3@A2 + b3

    A3 = Softmax(Z3)

    return Z1, A1, Z2, A2, Z3, A3




app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])

def prediction():
    data = request.json
    image_data = data['image']

    # strip the base64 prefix
    image_data = image_data.split(',')[1]
    
    # decode base64 to bytes
    image_bytes = base64.b64decode(image_data)

    # open with Pillow
    image = Image.open(io.BytesIO(image_bytes))
    
    # convert to grayscale and resize to 28x28
    image = image.convert('L')

    # convert to numpy array
    image_array = np.array(image)
    
    # invert (canvas is black on white, MNIST is white on black)
    image_array = 255 - image_array

    coords = np.argwhere(image_array > 0) ##finds out everywhere thats not a zero
    if len(coords) > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        
        # crop to just the digit
        image = Image.fromarray(image_array).crop((x_min, y_min, x_max, y_max))
        
        # add padding so it looks like MNIST
        image = image.resize((20, 20))
        image = image.filter(ImageFilter.MaxFilter(3))
        padded = Image.new('L', (28, 28), 0)
        padded.paste(image, (4, 4))
        image = padded
        
        # normalize and reshape to (784, 1)
        image_array = np.array(image) / 255.0
        image_array = image_array.reshape(784, 1)


    # run forward pass
    _, _, _, _, _, A3 = forward_pass(image_array)

    prediction = int(np.argmax(A3))
    probabilities = A3.flatten().tolist()
    

    return jsonify({"prediction": prediction, "probabilities": probabilities})




if __name__ == "__main__":
    app.run(debug=True)