# MNIST Digit Classifier

A fully connected neural network built from scratch in pure NumPy.

Trained on 60,000 handwritten digit images, achieving **97.97% test accuracy**.

## How it works

- Xavier weight initialization
- Forward pass: linear layers (Z = WX + b), ReLU activations, Softmax output
- Backward pass: all gradients derived by hand using the chain rule
- Adam optimizer with mini-batch gradient descent

Wrapped in a React + Flask web app where you draw a digit and the model predicts it in real time.

## Try it

[https://mnist-live-demo-ml-model.onrender.com](#) ← replace with your Render link
