"""
Number Guessing Game
A classic intro CS program demonstrating:
- Variables and data types
- User input
- While loops
- Conditionals (if/elif/else)
- Random number generation
- Functions
"""

import random


def play_game():
    """Play one round of the guessing game."""
    secret_number = random.randint(1, 100)
    attempts = 0
    max_attempts = 7

    print("\nI'm thinking of a number between 1 and 100.")
    print(f"You have {max_attempts} attempts to guess it!\n")

    while attempts < max_attempts:
        # Get user input
        try:
            guess = int(input("Enter your guess: "))
        except ValueError:
            print("Please enter a valid number.\n")
            continue

        attempts += 1
        remaining = max_attempts - attempts

        # Check the guess
        if guess < secret_number:
            print(f"Too low! {remaining} attempts remaining.\n")
        elif guess > secret_number:
            print(f"Too high! {remaining} attempts remaining.\n")
        else:
            print(f"Congratulations! You guessed it in {attempts} attempts!")
            return True

    print(f"Game over! The number was {secret_number}.")
    return False


def main():
    """Main game loop."""
    print("=" * 40)
    print("   Welcome to the Number Guessing Game!")
    print("=" * 40)

    wins = 0
    games = 0

    while True:
        if play_game():
            wins += 1
        games += 1

        print(f"\nScore: {wins} wins out of {games} games")

        play_again = input("\nPlay again? (y/n): ").lower().strip()
        if play_again != 'y':
            break

    print("\nThanks for playing! Goodbye!")


if __name__ == "__main__":
    main()
