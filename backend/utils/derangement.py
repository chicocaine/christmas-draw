import random

def generate_derangement(items):
    while True:
        result = items[:]
        random.shuffle(result)
        if all(a != b for a, b in zip(items, result)):
            return result
