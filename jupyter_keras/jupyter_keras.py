from keras.layers import Dense, Dropout, Activation, Flatten
from keras.layers import Convolution2D, MaxPooling2D
from keras.utils import np_utils
from keras.datasets import mnist
from keras.callbacks import Callback
from keras.callbacks import ProgbarLogger
from ipykernel.comm import Comm


class TrainingInfoCallback(Callback):

    """
        Create a callback that will track and display training progress, loss, and accuracy
        :param total_losses: total loss percentage
        :param total_accuracy: total accuracy percentage
        :param sample_amount: number of samples/steps per epoch
        :param epochs: number of epochs
        :param total_progress: progress of training for all epochs
        :param epoch_progress: progress of training in current epoch
        :param mode: track if model is using samples (0) or steps (1)
    """

    def __init__(self):
        self.total_losses = []
        self.total_accuracy = []
        self.sample_amount = None
        self.epochs = None
        self.total_progress = 0
        self.progress = 0
        self.mode = 0

    """
        Get number of samples/steps per epoch and total number of epochs
    """

    def on_train_begin(self, logs={}):
        if "samples" in self.params:
            self.sample_amount = self.params["samples"]
        elif "nb_sample" in self.params:
            self.sample_amount = self.params["nb_sample"]
        else:
            self.sample_amount = self.params["steps"]
            self.mode = 1

        self.epochs = self.params["epochs"]

    """
        Output total loss and accuracy statistics
    """

    def on_train_end(self, logs={}):
        self.display_statistics()

    """
        Reset the current epoch's progress every new epoch
    """

    def on_epoch_begin(self, epoch, logs={}):
        self.progress = 0

    """
        Update statistics and output both total and current epoch progress
    """

    def on_batch_end(self, batch, logs={}):
        if self.mode == 0:
            self.progress += logs.get("size")
            self.total_progress += logs.get("size")
        else:
            self.progress += 1
            self.total_progress += 1
        self.total_losses.append(logs.get("loss"))
        self.total_accuracy.append(logs.get("acc"))
        self.display_progress()

    def display_progress(self):
        data = {
            "overall": ((self.total_progress / (self.sample_amount * self.epochs)) * 100),
            "current": ((self.progress / self.sample_amount) * 100)
        }
        my_comm = Comm(target_name='test', data=data)
        my_comm.send(data=data)

    
    def display_statistics(self):
        self.data = {
            "Loss: " + str(sum(self.total_losses) / float(len(self.total_losses)))
        }
        display(self)
        self.data = {
            "Accuracy: "
            + str(sum(self.total_accuracy) / float(len(self.total_accuracy)))
        }

    def on_msg(comm, msg):
        print(msg)
